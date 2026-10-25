import CampanadasCore
import Foundation
import Testing

struct ClockFaceTests {
    @Test func dialHighlightsTheLocalTwelveHourPosition() {
        let cases = [(0, 12), (1, 1), (11, 11), (12, 12), (13, 1), (23, 11)]
        for (hour, expected) in cases {
            let face = ClockFace(month: 1, day: 1, hour: hour, minute: 0, second: 0)
            let highlighted = (1...12).filter { face.highlights(hour: $0) }
            #expect(highlighted == [expected])
            #expect(face.hourOnDial == expected)
        }
    }

    @Test func handsUseSixDegreesPerMark() {
        let face = ClockFace(month: 12, day: 31, hour: 23, minute: 15, second: 30, nanosecond: 500_000_000)
        #expect(face.minuteAngle == 90)
        #expect(face.secondAngle == 183)
    }

    @Test func readsCivilTimeFromTheSameCalendar() {
        let calendar = CivilCalendar.gregorian(timeZone: TimeZone(secondsFromGMT: 9 * 3600)!)
        let date = CivilCalendar.date(2026, 12, 31, 23, 59, 58, calendar: calendar)
        let face = ClockFace(date: date, calendar: calendar)
        #expect(face.month == 12)
        #expect(face.day == 31)
        #expect(face.hour == 23)
        #expect(face.minute == 59)
        #expect(face.second == 58)
        #expect(face.hourOnDial == 11)
    }
}
