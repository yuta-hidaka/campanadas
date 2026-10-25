import CampanadasCore
import Combine
import Foundation

@MainActor
public final class ChimeLoopModel: ObservableObject {
    @Published public private(set) var state: ChimeState
    @Published public private(set) var face: ClockFace
    @Published public private(set) var scheduledReset: TimeInterval?

    private var engine: ChimeEngine
    private let player: any ChimePlaying
    private let calendar: Calendar
    private let armsResetTimer: Bool
    private var resetToken = 0

    public init(
        player: any ChimePlaying,
        now: Date = Date(),
        calendar: Calendar = CivilCalendar.gregorian(),
        isTest: Bool = false,
        armsResetTimer: Bool = true
    ) {
        let engine = ChimeEngine(isTest: isTest)
        self.engine = engine
        self.player = player
        self.calendar = calendar
        self.armsResetTimer = armsResetTimer
        state = engine.state
        face = ClockFace(date: now, calendar: calendar)
    }

    public var testTitle: String {
        state.isTest ? "TEST STOP" : "TEST"
    }

    public func toggleTest() {
        apply(engine.setTesting(!state.isTest))
    }

    public func tick(_ date: Date) {
        face = ClockFace(date: date, calendar: calendar)
        apply(engine.tick(date, calendar: calendar))
    }

    public func performScheduledReset() {
        guard scheduledReset != nil else { return }
        scheduledReset = nil
        engine.finishCelebrationReset()
        state = engine.state
    }

    private func apply(_ step: ChimeStep) {
        state = engine.state
        guard !step.isNoOp else { return }
        player.perform(step)
        guard let delay = step.resetGrapesAfter else { return }
        resetToken += 1
        let token = resetToken
        scheduledReset = delay
        guard armsResetTimer else { return }
        Task { @MainActor [weak self] in
            try? await Task.sleep(for: .seconds(delay))
            guard let self, self.resetToken == token else { return }
            self.performScheduledReset()
        }
    }
}
