import Foundation

public enum ChimeCopy {
    public static let prepare = "Prepararos para comer las uvas !!!"
    public static let cuartos = "Los Cuartos  !!!"
    public static let campanadas = "Las Campanadas  !!!"
    public static let feliz = "Feliz año nuevo!!!🥳"
    public static let grapeCount = 12
}

public enum ChimeCue: String, CaseIterable, Equatable, Sendable {
    case readyBell
    case cuartos
    case campanada
    case cheer

    public var fileName: String {
        switch self {
        case .readyBell: "bell2"
        case .cuartos: "cuartos"
        case .campanada: "bell"
        case .cheer: "cheer"
        }
    }
}

public struct ChimeStep: Equatable, Sendable {
    public var cues: [ChimeCue]
    public var retirePrevious: Bool
    public var stopAll: Bool
    public var resetGrapesAfter: TimeInterval?

    public init(
        cues: [ChimeCue] = [],
        retirePrevious: Bool = false,
        stopAll: Bool = false,
        resetGrapesAfter: TimeInterval? = nil
    ) {
        self.cues = cues
        self.retirePrevious = retirePrevious
        self.stopAll = stopAll
        self.resetGrapesAfter = resetGrapesAfter
    }

    public static let none = ChimeStep()

    public var isNoOp: Bool {
        cues.isEmpty && !retirePrevious && !stopAll && resetGrapesAfter == nil
    }
}

public struct ChimeState: Equatable, Sendable {
    public var label: String
    public var grapes: Int
    public var isTest: Bool

    public init(label: String, grapes: Int, isTest: Bool) {
        self.label = label
        self.grapes = grapes
        self.isTest = isTest
    }
}

/// Year-crossing bell sequence shared by the live clock and TEST.
///
/// Bells are the twelve grapes: one every three seconds from 00:00:00 through
/// 00:00:33. Preparation (bell2, cuartos, the campanadas label) belongs to
/// 23:59 on 31 December. TEST runs that same second-of-minute script on any date.
public struct ChimeEngine: Sendable {
    public private(set) var state: ChimeState
    private var lastSecond: SecondKey?

    public init(isTest: Bool = false) {
        state = ChimeState(
            label: ChimeCopy.prepare,
            grapes: ChimeCopy.grapeCount,
            isTest: isTest
        )
    }

    /// TEST STOP unloads audio and returns the instruction line. The grape count stays.
    public mutating func setTesting(_ isTest: Bool) -> ChimeStep {
        state.isTest = isTest
        guard !isTest else { return .none }
        state.label = ChimeCopy.prepare
        return ChimeStep(stopAll: true)
    }

    public mutating func finishCelebrationReset() {
        state.grapes = ChimeCopy.grapeCount
    }

    public mutating func tick(_ date: Date, calendar: Calendar = CivilCalendar.gregorian()) -> ChimeStep {
        let parts = calendar.dateComponents(
            [.year, .month, .day, .hour, .minute, .second],
            from: date
        )
        guard
            let year = parts.year,
            let month = parts.month,
            let day = parts.day,
            let hour = parts.hour,
            let minute = parts.minute,
            let second = parts.second
        else {
            return .none
        }

        let key = SecondKey(year: year, month: month, day: day, hour: hour, minute: minute, second: second)
        if lastSecond == key { return .none }
        lastSecond = key

        let inEve = month == 12 && day == 31 && hour == 23 && minute == 59
        let inBells = month == 1 && day == 1 && hour == 0 && minute == 0 && second <= 34
        guard state.isTest || inEve || inBells else { return .none }

        var step = ChimeStep.none
        let strikes = (second == 0 || second % 3 == 0) && second <= 33 && (month == 1 || state.isTest)
        if strikes {
            state.grapes = ChimeCopy.grapeCount - second / 3
            step.cues.append(.campanada)
        }

        switch second {
        case 0:
            step.retirePrevious = true
        case 34:
            if !state.isTest && month == 12 { break }
            step.cues.append(.cheer)
            state.label = ChimeCopy.feliz
            state.grapes = 0
            step.resetGrapesAfter = 5
        case 36:
            if !state.isTest && month == 1 { break }
            state.label = ChimeCopy.prepare
            if state.isTest || minute == 59 {
                step.cues.append(.readyBell)
            }
        case 44:
            if !state.isTest && month == 1 { break }
            step.cues.append(.cuartos)
            state.label = ChimeCopy.cuartos
        case 58:
            let coming = state.isTest || (minute == 59 && month == 12)
            state.label = coming ? ChimeCopy.campanadas : ChimeCopy.prepare
        default:
            break
        }
        return step
    }
}

private struct SecondKey: Equatable {
    var year: Int
    var month: Int
    var day: Int
    var hour: Int
    var minute: Int
    var second: Int
}
