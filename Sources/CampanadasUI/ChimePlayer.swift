import AVFoundation
import CampanadasCore
import Foundation

@MainActor
public protocol ChimePlaying: AnyObject {
    func perform(_ step: ChimeStep)
}

public enum ChimeAudio {
    public static func resourceURL(for cue: ChimeCue) -> URL? {
        Bundle.module.url(forResource: cue.fileName, withExtension: "mp3")
    }
}

@MainActor
public final class AVChimePlayer: ChimePlaying {
    private var active: [AVAudioPlayer] = []

    public init() {
        #if os(iOS) || os(tvOS)
        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.playback, mode: .default)
        try? session.setActive(true)
        #endif
    }

    public func perform(_ step: ChimeStep) {
        if step.stopAll {
            active.forEach { $0.stop() }
            active.removeAll()
            return
        }

        var started: [AVAudioPlayer] = []
        for cue in step.cues {
            guard
                let url = ChimeAudio.resourceURL(for: cue),
                let player = try? AVAudioPlayer(contentsOf: url)
            else { continue }
            player.prepareToPlay()
            player.play()
            started.append(player)
            active.append(player)
        }

        if step.retirePrevious {
            let keep = Set(started.map(ObjectIdentifier.init))
            active.removeAll { player in
                let id = ObjectIdentifier(player)
                if keep.contains(id) { return false }
                player.stop()
                return true
            }
        } else {
            let keep = Set(started.map(ObjectIdentifier.init))
            active.removeAll { player in
                !player.isPlaying && !keep.contains(ObjectIdentifier(player))
            }
        }
    }
}
