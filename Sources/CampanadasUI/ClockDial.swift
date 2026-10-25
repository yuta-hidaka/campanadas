import CampanadasCore
import SwiftUI

enum ClockPalette {
    static let paper = Color.white
    static let ink = Color(red: 0.36, green: 0.38, blue: 0.34)
    static let grape = Color(red: 170 / 255, green: 207 / 255, blue: 83 / 255)
    static let ring = Color(red: 0.83, green: 0.85, blue: 0.81)
    static let quiet = Color(red: 0.54, green: 0.56, blue: 0.52)
}

struct ClockDial: View {
    var face: ClockFace

    private let hours = Array(1...12)

    var body: some View {
        ZStack {
            Circle()
                .stroke(ClockPalette.ring, lineWidth: 1)
            ForEach(hours, id: \.self, content: marker)
            pip(diameter: 10, radius: 118, angle: face.minuteAngle)
            pip(diameter: 7, radius: 118, angle: face.secondAngle)
            VStack(spacing: 4) {
                Text(face.dateText)
                Text(face.timeText)
            }
            .font(.system(size: 22, weight: .medium, design: .serif).monospacedDigit())
            .foregroundStyle(ClockPalette.quiet)
            .accessibilityHidden(true)
        }
        .frame(width: 300, height: 300)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(face.dateText), \(spokenTime), hour \(face.hourOnDial)")
    }

    private var spokenTime: String {
        String(format: "%02d:%02d:%02d", face.hour, face.minute, face.second)
    }

    private func marker(_ hour: Int) -> some View {
        let highlighted = face.highlights(hour: hour)
        return Text("\(hour)")
            .font(.system(size: 16, weight: .semibold, design: .serif))
            .foregroundStyle(highlighted ? Color.white : ClockPalette.ink)
            .frame(width: 28, height: 28)
            .background(highlighted ? ClockPalette.grape : Color.clear, in: Circle())
            .rotationEffect(.degrees(-Double(hour) * 30))
            .offset(y: -132)
            .rotationEffect(.degrees(Double(hour) * 30))
    }

    private func pip(diameter: CGFloat, radius: CGFloat, angle: Double) -> some View {
        Circle()
            .fill(ClockPalette.grape)
            .frame(width: diameter, height: diameter)
            .offset(y: -radius)
            .rotationEffect(.degrees(angle))
    }
}
