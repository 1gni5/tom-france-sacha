//
//  AudioPlayer.swift
//  TOMFrance.Sacha
//
//  Created by Jules Ducange on 15/07/2025.
//


import AVFoundation
import Combine

class AudioPlayer: NSObject, ObservableObject, AVAudioPlayerDelegate {
    private var audioPlayer: AVAudioPlayer?
    private var audioSession = AVAudioSession.sharedInstance()
    
    @Published var isPlaying = false
    
    override init() {
        super.init()
        setupAudioSession()
    }
    
    private func setupAudioSession() {
        do {
            try audioSession.setCategory(.playback, mode: .default, options: [.allowBluetooth])
            try audioSession.setActive(true)
            print("Playback audio session configured successfully")
        } catch {
            print("Failed to set up playback audio session: \(error)")
        }
    }
    
    func playAudio(from data: Data) {
        stopAudio()
        
        guard data.count > 0 else {
            print("Audio data is empty")
            return
        }
        
        do {
            try audioSession.setCategory(.playback, mode: .default, options: [.allowBluetooth])
            try audioSession.setActive(true)
            
            let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("temp_playback.wav")
            try data.write(to: tempURL)
            
            audioPlayer = try AVAudioPlayer(contentsOf: tempURL)
            audioPlayer?.delegate = self
            audioPlayer?.prepareToPlay()
            audioPlayer?.volume = 1.0
            
            let success = audioPlayer?.play() ?? false
            if success {
                isPlaying = true
                print("Audio playback started, duration: \(audioPlayer?.duration ?? 0) seconds")
            } else {
                print("Failed to start audio playback")
            }
        } catch {
            print("Could not play audio: \(error)")
            do {
                audioPlayer = try AVAudioPlayer(data: data)
                audioPlayer?.delegate = self
                audioPlayer?.prepareToPlay()
                audioPlayer?.volume = 1.0
                
                let success = audioPlayer?.play() ?? false
                if success {
                    isPlaying = true
                    print("Audio playback started (direct data), duration: \(audioPlayer?.duration ?? 0) seconds")
                } else {
                    print("Failed to start audio playback (direct data)")
                }
            } catch {
                print("Could not play audio with direct data approach: \(error)")
            }
        }
    }
    
    func stopAudio() {
        audioPlayer?.stop()
        isPlaying = false
        print("Audio playback stopped")
    }
    
    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        DispatchQueue.main.async {
            self.isPlaying = false
            print("Audio finished playing successfully: \(flag)")
        }
    }
    
    func audioPlayerDecodeErrorDidOccur(_ player: AVAudioPlayer, error: Error?) {
        DispatchQueue.main.async {
            self.isPlaying = false
            print("Audio decode error: \(error?.localizedDescription ?? "Unknown error")")
        }
    }
}
