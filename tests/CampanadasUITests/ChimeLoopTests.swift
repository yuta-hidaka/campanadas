import CampanadasCore
import CampanadasUI
import Foundation
import Testing

@MainActor
struct ChimeLoopTests {
    private let calendar = CivilCalendar.gregorian(timeZone: TimeZone(secondsFromGMT: 0)!)

    private func at(_ year: Int, _ month: Int, _ day: Int, _ hour: Int, _ minute: Int, _ second: Int) -> Date {
        CivilCalendar.date(year, month, day, hour, minute, second, calendar: calendar)
    }

    @Test func loopPlaysTheYearCrossingThroughThePlayer() {
        let player = RecordingPlayer()
        let model = ChimeLoopModel(
            player: player,
            now: at(2026, 12, 31, 23, 59, 0),
            calendar: calendar,
            armsResetTimer: false
        )
        model.tick(at(2026, 12, 31, 23, 59, 36))
        model.tick(at(2026, 12, 31, 23, 59, 44))
        model.tick(at(2026, 12, 31, 23, 59, 58))
        #expect(model.face.hourOnDial == 11)
        #expect(model.face.minute == 59)
        for second in stride(from: 0, through: 33, by: 3) {
            model.tick(at(2027, 1, 1, 0, 0, second))
        }
        model.tick(at(2027, 1, 1, 0, 0, 34))
        #expect(player.cues == [.readyBell, .cuartos] + Array(repeating: ChimeCue.campanada, count: 12) + [.cheer])
        #expect(player.retires == 1)
        #expect(model.scheduledReset == 5)
        #expect(model.state.grapes == 0)
        #expect(model.state.label == ChimeCopy.feliz)
        #expect(model.face.hourOnDial == 12)
        model.performScheduledReset()
        #expect(model.state.grapes == 12)
        #expect(model.state.label == ChimeCopy.feliz)
    }

    @Test func testToggleFeedsTheSameScriptAndCanStop() {
        let player = RecordingPlayer()
        let model = ChimeLoopModel(
            player: player,
            now: at(2030, 6, 15, 12, 17, 0),
            calendar: calendar,
            armsResetTimer: false
        )
        #expect(model.testTitle == "TEST")
        model.toggleTest()
        #expect(model.testTitle == "TEST STOP")
        for second in [36, 44, 58, 0, 3, 34] {
            model.tick(at(2030, 6, 15, 12, 17, second))
        }
        #expect(player.cues == [.readyBell, .cuartos, .campanada, .campanada, .cheer])
        model.toggleTest()
        #expect(player.stops == 1)
        #expect(model.state.label == ChimeCopy.prepare)
        #expect(model.testTitle == "TEST")
    }

    @Test func clockFaceAdvancesWhenTheEngineIgnoresTheSameSecond() {
        let player = RecordingPlayer()
        let model = ChimeLoopModel(
            player: player,
            now: at(2027, 1, 1, 12, 0, 3),
            calendar: calendar,
            armsResetTimer: false
        )
        let first = CivilCalendar.date(2027, 1, 1, 12, 0, 10, nanosecond: 0, calendar: calendar)
        let later = CivilCalendar.date(2027, 1, 1, 12, 0, 10, nanosecond: 400_000_000, calendar: calendar)
        model.tick(first)
        model.tick(later)
        #expect(player.cues.isEmpty)
        #expect(model.face.second == 10)
        #expect(model.face.secondAngle > 62)
        #expect(model.face.secondAngle < 63)
    }

    @Test func bundledCuesResolveForAVFoundation() throws {
        let assets = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .appendingPathComponent("assets")
        for cue in ChimeCue.allCases {
            let url = try #require(ChimeAudio.resourceURL(for: cue))
            let bundled = try Data(contentsOf: url)
            let original = try Data(contentsOf: assets.appendingPathComponent(cue.fileName + ".mp3"))
            #expect(bundled == original)
        }
    }
}

@MainActor
private final class RecordingPlayer: ChimePlaying {
    var cues: [ChimeCue] = []
    var retires = 0
    var stops = 0

    func perform(_ step: ChimeStep) {
        cues.append(contentsOf: step.cues)
        if step.retirePrevious { retires += 1 }
        if step.stopAll { stops += 1 }
    }
}
