import CampanadasCore
import Foundation
import Testing

struct ChimeEngineTests {
    private let calendar = CivilCalendar.gregorian(timeZone: TimeZone(secondsFromGMT: 0)!)

    private func at(_ year: Int, _ month: Int, _ day: Int, _ hour: Int, _ minute: Int, _ second: Int) -> Date {
        CivilCalendar.date(year, month, day, hour, minute, second, calendar: calendar)
    }

    private func cues(of step: ChimeStep) -> [ChimeCue] {
        step.cues
    }

    @Test func doesNotRingOnNewYearsDayAtNoon() {
        var engine = ChimeEngine()
        let step = engine.tick(at(2027, 1, 1, 12, 0, 3), calendar: calendar)
        #expect(cues(of: step).isEmpty)
        #expect(engine.state.grapes == 12)
        #expect(engine.state.label == ChimeCopy.prepare)
    }

    @Test func doesNotPlayCuartosOnNewYearsEveAtNoon() {
        var engine = ChimeEngine()
        let step = engine.tick(at(2026, 12, 31, 12, 0, 44), calendar: calendar)
        #expect(step == .none)
        #expect(engine.state.label == ChimeCopy.prepare)
    }

    @Test func rejectsAdjacentDatesHoursAndMinutes() {
        let outside = [
            (2026, 12, 30, 23, 59),
            (2026, 12, 31, 22, 59),
            (2026, 12, 31, 23, 58),
            (2027, 1, 1, 0, 1),
            (2027, 1, 1, 1, 0),
            (2027, 1, 2, 0, 0),
        ]
        for (year, month, day, hour, minute) in outside {
            var engine = ChimeEngine()
            for second in [3, 34, 36, 44, 58, 0] {
                let step = engine.tick(at(year, month, day, hour, minute, second), calendar: calendar)
                #expect(step.isNoOp)
            }
            #expect(engine.state.grapes == 12)
            #expect(engine.state.label == ChimeCopy.prepare)
        }
    }

    @Test func preparesBeforeMidnight() {
        var engine = ChimeEngine()
        let ready = engine.tick(at(2026, 12, 31, 23, 59, 36), calendar: calendar)
        #expect(ready.cues == [.readyBell])
        let cuartos = engine.tick(at(2026, 12, 31, 23, 59, 44), calendar: calendar)
        #expect(cuartos.cues == [.cuartos])
        #expect(engine.state.label == ChimeCopy.cuartos)
        _ = engine.tick(at(2026, 12, 31, 23, 59, 58), calendar: calendar)
        #expect(engine.state.label == ChimeCopy.campanadas)
        #expect(engine.state.grapes == 12)
    }

    @Test func doesNotStrikeBellsBeforeMidnight() {
        var engine = ChimeEngine()
        let step = engine.tick(at(2026, 12, 31, 23, 59, 3), calendar: calendar)
        #expect(step.cues.isEmpty)
        #expect(engine.state.grapes == 12)
    }

    @Test func ringsTwelveBellsAcrossMidnightAndCelebrates() {
        var engine = ChimeEngine()
        _ = engine.tick(at(2026, 12, 31, 23, 59, 58), calendar: calendar)
        var played: [ChimeCue] = []
        for second in stride(from: 0, through: 33, by: 3) {
            let step = engine.tick(at(2027, 1, 1, 0, 0, second), calendar: calendar)
            played.append(contentsOf: step.cues)
            #expect(engine.state.grapes == 12 - second / 3)
            if second == 0 {
                #expect(step.retirePrevious)
            }
        }
        #expect(played == Array(repeating: ChimeCue.campanada, count: 12))
        let cheer = engine.tick(at(2027, 1, 1, 0, 0, 34), calendar: calendar)
        #expect(cheer.cues == [.cheer])
        #expect(cheer.resetGrapesAfter == 5)
        #expect(engine.state.grapes == 0)
        #expect(engine.state.label == ChimeCopy.feliz)
        engine.finishCelebrationReset()
        #expect(engine.state.grapes == 12)
        #expect(engine.state.label == ChimeCopy.feliz)
    }

    @Test func doesNotRestartPreparationAfterCelebration() {
        var engine = ChimeEngine()
        _ = engine.tick(at(2027, 1, 1, 0, 0, 34), calendar: calendar)
        for second in [36, 44, 58, 59] {
            let step = engine.tick(at(2027, 1, 1, 0, 0, second), calendar: calendar)
            #expect(step.isNoOp)
        }
        #expect(engine.state.label == ChimeCopy.feliz)
    }

    @Test func worksForLaterYears() {
        for year in [2028, 2031, 2040] {
            var engine = ChimeEngine()
            let cuartos = engine.tick(at(year - 1, 12, 31, 23, 59, 44), calendar: calendar)
            let bell = engine.tick(at(year, 1, 1, 0, 0, 3), calendar: calendar)
            #expect(cuartos.cues == [.cuartos])
            #expect(bell.cues == [.campanada])
            #expect(engine.state.grapes == 11)
        }
    }

    @Test func testModeRunsTheScriptOnAnArbitraryAfternoon() {
        var engine = ChimeEngine(isTest: true)
        var played: [ChimeCue] = []
        for second in [36, 44, 58, 0, 3, 34] {
            let step = engine.tick(at(2030, 6, 15, 12, 17, second), calendar: calendar)
            played.append(contentsOf: step.cues)
        }
        #expect(played == [.readyBell, .cuartos, .campanada, .campanada, .cheer])
        #expect(engine.state.label == ChimeCopy.feliz)
        #expect(engine.state.grapes == 0)
    }

    @Test func ignoresARepeatedCivilSecond() {
        var engine = ChimeEngine(isTest: true)
        let first = engine.tick(at(2030, 6, 15, 12, 17, 44), calendar: calendar)
        let second = engine.tick(at(2030, 6, 15, 12, 17, 44), calendar: calendar)
        #expect(first.cues == [.cuartos])
        #expect(second == .none)
        #expect(engine.state.label == ChimeCopy.cuartos)
    }

    @Test func stoppingTestUnloadsAndRestoresTheInstruction() {
        var engine = ChimeEngine(isTest: true)
        _ = engine.tick(at(2030, 6, 15, 12, 17, 44), calendar: calendar)
        let step = engine.setTesting(false)
        #expect(step.stopAll)
        #expect(engine.state.label == ChimeCopy.prepare)
        #expect(engine.state.isTest == false)
    }
}
