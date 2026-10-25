import CampanadasUI
import SwiftUI

@main
struct CampanadasMain: App {
    var body: some Scene {
        WindowGroup {
            ChimeLoopView()
        }
        #if os(macOS)
        .defaultSize(width: 420, height: 760)
        #endif
    }
}
