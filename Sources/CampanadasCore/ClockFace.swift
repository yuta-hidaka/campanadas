import Foundation

public struct ClockFace: Equatable, Sendable {
    public var month: Int
    public var day: Int
    public var hour: Int
    public var minute: Int
    public var second: Int
    public var nanosecond: Int

    public init(month: Int, day: Int, hour: Int, minute: Int, second: Int, nanosecond: Int = 0) {
        self.month = month
        self.day = day
        self.hour = hour
        self.minute = minute
        self.second = second
        self.nanosecond = nanosecond
    }

    public init(date: Date, calendar: Calendar = CivilCalendar.gregorian()) {
        let parts = calendar.dateComponents(
            [.month, .day, .hour, .minute, .second, .nanosecond],
            from: date
        )
        self.init(
            month: parts.month ?? 1,
            day: parts.day ?? 1,
            hour: parts.hour ?? 0,
            minute: parts.minute ?? 0,
            second: parts.second ?? 0,
            nanosecond: parts.nanosecond ?? 0
        )
    }

    /// Local 12-hour position. Midnight and noon both sit on 12.
    public var hourOnDial: Int {
        let wrapped = hour % 12
        return wrapped == 0 ? 12 : wrapped
    }

    public func highlights(hour marker: Int) -> Bool {
        marker == hourOnDial
    }

    public var minuteAngle: Double {
        Double(minute) * 6
    }

    public var secondAngle: Double {
        (Double(second) + Double(nanosecond) / 1_000_000_000) * 6
    }

    public var dateText: String {
        String(format: "%02d  %02d", month, day)
    }

    public var timeText: String {
        String(format: "%02d  %02d  %02d", hour, minute, second)
    }
}
