import Foundation

public enum CivilCalendar {
    public static func gregorian(timeZone: TimeZone = .current) -> Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = timeZone
        return calendar
    }

    public static func date(
        _ year: Int,
        _ month: Int,
        _ day: Int,
        _ hour: Int,
        _ minute: Int,
        _ second: Int,
        nanosecond: Int = 0,
        calendar: Calendar
    ) -> Date {
        let parts = DateComponents(
            calendar: calendar,
            timeZone: calendar.timeZone,
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            second: second,
            nanosecond: nanosecond
        )
        guard let date = calendar.date(from: parts) else {
            preconditionFailure("incomplete civil date")
        }
        return date
    }
}
