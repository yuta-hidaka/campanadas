import CampanadasCore
import CampanadasUI
import Foundation

@main
enum CampanadasCoreCheck {
    static func main() async {
        var failures = 0
        failures += runSync("year-cross / TEST engine", chimeEngineChecks)
        failures += runSync("clock face", clockFaceChecks)
        failures += runMain("SwiftUI loop + AVFoundation resources", loopChecks)
        if failures > 0 {
            fputs("FAILED \(failures) check group(s)\n", stderr)
            exit(1)
        }
        print("OK CampanadasCoreCheck")
    }
}

private func runSync(_ name: String, _ body: () throws -> Void) -> Int {
    do {
        try body()
        print("PASS \(name)")
        return 0
    } catch {
        fputs("FAIL \(name): \(error)\n", stderr)
        return 1
    }
}

@MainActor
private func runMain(_ name: String, _ body: @MainActor () throws -> Void) -> Int {
    do {
        try body()
        print("PASS \(name)")
        return 0
    } catch {
        fputs("FAIL \(name): \(error)\n", stderr)
        return 1
    }
}

private struct Expectation: Error, CustomStringConvertible {
    let description: String
}

private func expect(_ condition: Bool, _ message: @autoclosure () -> String) throws {
    if !condition { throw Expectation(description: message()) }
}

private func expectEqual<T: Equatable>(_ actual: T, _ expected: T, _ message: String) throws {
    try expect(actual == expected, "\(message): got \(actual), expected \(expected)")
}

private let calendar = CivilCalendar.gregorian(timeZone: TimeZone(secondsFromGMT: 0)!)

private func at(
    _ year: Int, _ month: Int, _ day: Int,
    _ hour: Int, _ minute: Int, _ second: Int,
    nanosecond: Int = 0
) -> Date {
    CivilCalendar.date(year, month, day, hour, minute, second, nanosecond: nanosecond, calendar: calendar)
}

private func chimeEngineChecks() throws {
    do {
        var engine = ChimeEngine()
        let step = engine.tick(at(2027, 1, 1, 12, 0, 3), calendar: calendar)
        try expect(step.cues.isEmpty, "noon cues")
        try expectEqual(engine.state.grapes, 12, "noon grapes")
        try expectEqual(engine.state.label, ChimeCopy.prepare, "noon label")
    }

    do {
        var engine = ChimeEngine()
        let step = engine.tick(at(2026, 12, 31, 12, 0, 44), calendar: calendar)
        try expectEqual(step, .none, "eve noon")
        try expectEqual(engine.state.label, ChimeCopy.prepare, "eve noon label")
    }

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
            try expect(step.isNoOp, "outside \(year)-\(month)-\(day) :\(second)")
        }
        try expectEqual(engine.state.grapes, 12, "outside grapes")
        try expectEqual(engine.state.label, ChimeCopy.prepare, "outside label")
    }

    do {
        var engine = ChimeEngine()
        try expectEqual(
            engine.tick(at(2026, 12, 31, 23, 59, 36), calendar: calendar).cues,
            [.readyBell],
            "ready"
        )
        let cuartos = engine.tick(at(2026, 12, 31, 23, 59, 44), calendar: calendar)
        try expectEqual(cuartos.cues, [.cuartos], "cuartos")
        try expectEqual(engine.state.label, ChimeCopy.cuartos, "cuartos label")
        _ = engine.tick(at(2026, 12, 31, 23, 59, 58), calendar: calendar)
        try expectEqual(engine.state.label, ChimeCopy.campanadas, "pre-midnight")
        try expectEqual(engine.state.grapes, 12, "pre-midnight grapes")
    }

    do {
        var engine = ChimeEngine()
        let step = engine.tick(at(2026, 12, 31, 23, 59, 3), calendar: calendar)
        try expect(step.cues.isEmpty, "no bells before midnight")
        try expectEqual(engine.state.grapes, 12, "eve grapes")
    }

    do {
        var engine = ChimeEngine()
        _ = engine.tick(at(2026, 12, 31, 23, 59, 58), calendar: calendar)
        var played: [ChimeCue] = []
        for second in stride(from: 0, through: 33, by: 3) {
            let step = engine.tick(at(2027, 1, 1, 0, 0, second), calendar: calendar)
            played.append(contentsOf: step.cues)
            try expectEqual(engine.state.grapes, 12 - second / 3, "grape :\(second)")
            if second == 0 {
                try expect(step.retirePrevious, "retire at :0")
            }
        }
        try expectEqual(played, Array(repeating: ChimeCue.campanada, count: 12), "twelve bells")
        let cheer = engine.tick(at(2027, 1, 1, 0, 0, 34), calendar: calendar)
        try expectEqual(cheer.cues, [.cheer], "cheer")
        try expectEqual(cheer.resetGrapesAfter, 5, "reset delay")
        try expectEqual(engine.state.grapes, 0, "celebration grapes")
        try expectEqual(engine.state.label, ChimeCopy.feliz, "feliz")
        engine.finishCelebrationReset()
        try expectEqual(engine.state.grapes, 12, "reset grapes")
        try expectEqual(engine.state.label, ChimeCopy.feliz, "holds feliz")
    }

    do {
        var engine = ChimeEngine()
        _ = engine.tick(at(2027, 1, 1, 0, 0, 34), calendar: calendar)
        for second in [36, 44, 58, 59] {
            let step = engine.tick(at(2027, 1, 1, 0, 0, second), calendar: calendar)
            try expect(step.isNoOp, "no restart :\(second)")
        }
        try expectEqual(engine.state.label, ChimeCopy.feliz, "holds feliz")
    }

    for year in [2028, 2031, 2040] {
        var engine = ChimeEngine()
        let cuartos = engine.tick(at(year - 1, 12, 31, 23, 59, 44), calendar: calendar)
        let bell = engine.tick(at(year, 1, 1, 0, 0, 3), calendar: calendar)
        try expectEqual(cuartos.cues, [.cuartos], "year \(year) cuartos")
        try expectEqual(bell.cues, [.campanada], "year \(year) bell")
        try expectEqual(engine.state.grapes, 11, "year \(year) grapes")
    }

    do {
        var engine = ChimeEngine(isTest: true)
        var played: [ChimeCue] = []
        for second in [36, 44, 58, 0, 3, 34] {
            played.append(contentsOf: engine.tick(at(2030, 6, 15, 12, 17, second), calendar: calendar).cues)
        }
        try expectEqual(
            played,
            [.readyBell, .cuartos, .campanada, .campanada, .cheer],
            "TEST sequence"
        )
        try expectEqual(engine.state.label, ChimeCopy.feliz, "TEST feliz")
        try expectEqual(engine.state.grapes, 0, "TEST grapes")
    }

    do {
        var engine = ChimeEngine(isTest: true)
        let first = engine.tick(at(2030, 6, 15, 12, 17, 44), calendar: calendar)
        let second = engine.tick(at(2030, 6, 15, 12, 17, 44), calendar: calendar)
        try expectEqual(first.cues, [.cuartos], "first tick")
        try expectEqual(second, .none, "duplicate second")
    }

    do {
        var engine = ChimeEngine(isTest: true)
        _ = engine.tick(at(2030, 6, 15, 12, 17, 44), calendar: calendar)
        let step = engine.setTesting(false)
        try expect(step.stopAll, "stopAll")
        try expectEqual(engine.state.label, ChimeCopy.prepare, "restored label")
        try expectEqual(engine.state.isTest, false, "isTest false")
    }
}

private func clockFaceChecks() throws {
    let cases = [(0, 12), (1, 1), (11, 11), (12, 12), (13, 1), (23, 11)]
    for (hour, expected) in cases {
        let face = ClockFace(month: 1, day: 1, hour: hour, minute: 0, second: 0)
        let highlighted = (1...12).filter { face.highlights(hour: $0) }
        try expectEqual(highlighted, [expected], "highlight hour \(hour)")
        try expectEqual(face.hourOnDial, expected, "dial hour \(hour)")
    }

    do {
        let face = ClockFace(month: 12, day: 31, hour: 23, minute: 15, second: 30, nanosecond: 500_000_000)
        try expectEqual(face.minuteAngle, 90, "minute angle")
        try expectEqual(face.secondAngle, 183, "second angle")
    }

    do {
        let tokyo = CivilCalendar.gregorian(timeZone: TimeZone(secondsFromGMT: 9 * 3600)!)
        let date = CivilCalendar.date(2026, 12, 31, 23, 59, 58, calendar: tokyo)
        let face = ClockFace(date: date, calendar: tokyo)
        try expectEqual(face.month, 12, "month")
        try expectEqual(face.day, 31, "day")
        try expectEqual(face.hour, 23, "hour")
        try expectEqual(face.minute, 59, "minute")
        try expectEqual(face.second, 58, "second")
        try expectEqual(face.hourOnDial, 11, "hourOnDial")
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

@MainActor
private func loopChecks() throws {
    for cue in ChimeCue.allCases {
        guard let url = ChimeAudio.resourceURL(for: cue) else {
            throw Expectation(description: "missing bundled \(cue.fileName).mp3")
        }
        try expect(FileManager.default.fileExists(atPath: url.path), "exists \(cue.fileName)")
        let repoAssets = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent() // CampanadasCoreCheck
            .deletingLastPathComponent() // Sources
            .deletingLastPathComponent() // package root
            .appendingPathComponent("assets")
            .appendingPathComponent(cue.fileName + ".mp3")
        if FileManager.default.fileExists(atPath: repoAssets.path) {
            let bundled = try Data(contentsOf: url)
            let original = try Data(contentsOf: repoAssets)
            try expect(bundled == original, "bytes match \(cue.fileName)")
        }
    }

    do {
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
        try expectEqual(model.face.hourOnDial, 11, "eve dial")
        try expectEqual(model.face.minute, 59, "eve minute")
        for second in stride(from: 0, through: 33, by: 3) {
            model.tick(at(2027, 1, 1, 0, 0, second))
        }
        model.tick(at(2027, 1, 1, 0, 0, 34))
        try expectEqual(
            player.cues,
            [.readyBell, .cuartos] + Array(repeating: ChimeCue.campanada, count: 12) + [.cheer],
            "year-cross cues"
        )
        try expectEqual(player.retires, 1, "retires")
        try expectEqual(model.scheduledReset, 5, "scheduled reset")
        try expectEqual(model.state.grapes, 0, "zero grapes")
        try expectEqual(model.state.label, ChimeCopy.feliz, "feliz")
        try expectEqual(model.face.hourOnDial, 12, "new year dial")
        model.performScheduledReset()
        try expectEqual(model.state.grapes, 12, "reset grapes")
    }

    do {
        let player = RecordingPlayer()
        let model = ChimeLoopModel(
            player: player,
            now: at(2030, 6, 15, 12, 17, 0),
            calendar: calendar,
            armsResetTimer: false
        )
        try expectEqual(model.testTitle, "TEST", "test title")
        model.toggleTest()
        try expectEqual(model.testTitle, "TEST STOP", "test stop title")
        for second in [36, 44, 58, 0, 3, 34] {
            model.tick(at(2030, 6, 15, 12, 17, second))
        }
        try expectEqual(
            player.cues,
            [.readyBell, .cuartos, .campanada, .campanada, .cheer],
            "TEST cues"
        )
        model.toggleTest()
        try expectEqual(player.stops, 1, "stops")
        try expectEqual(model.state.label, ChimeCopy.prepare, "restored")
        try expectEqual(model.testTitle, "TEST", "title after stop")
    }
}
