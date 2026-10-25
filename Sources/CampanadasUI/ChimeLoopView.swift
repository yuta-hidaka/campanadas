import CampanadasCore
import SwiftUI

public struct ChimeLoopView: View {
    @StateObject private var model: ChimeLoopModel

    public init(player: (any ChimePlaying)? = nil) {
        let resolved = player ?? AVChimePlayer()
        _model = StateObject(wrappedValue: ChimeLoopModel(player: resolved))
    }

    public init(model: ChimeLoopModel) {
        _model = StateObject(wrappedValue: model)
    }

    public var body: some View {
        ZStack {
            ClockPalette.paper.ignoresSafeArea()
            VStack(spacing: 0) {
                Text(model.state.label)
                    .font(.system(size: 22, weight: .semibold, design: .serif))
                    .foregroundStyle(ClockPalette.ink)
                    .multilineTextAlignment(.center)
                    .lineSpacing(2)
                    .padding(.top, 28)
                    .accessibilityAddTraits(.updatesFrequently)
                Text("\(model.state.grapes)")
                    .font(.system(size: 72, weight: .bold, design: .rounded))
                    .foregroundStyle(model.state.label == ChimeCopy.feliz ? ClockPalette.grape : ClockPalette.ink)
                    .padding(.top, 8)
                    .accessibilityLabel("\(model.state.grapes) uvas")
                ClockDial(face: model.face)
                    .padding(.top, 36)
                Spacer(minLength: 24)
                Button(model.testTitle) {
                    model.toggleTest()
                }
                .font(.system(size: 17, weight: .medium, design: .serif))
                .buttonStyle(.bordered)
                .tint(ClockPalette.quiet)
                .accessibilityIdentifier("chime-test-toggle")
                .padding(.bottom, 28)
            }
            .padding(.horizontal, 28)
            .frame(maxWidth: 420)
        }
        .task {
            while !Task.isCancelled {
                model.tick(Date())
                try? await Task.sleep(for: .milliseconds(100))
            }
        }
    }
}
