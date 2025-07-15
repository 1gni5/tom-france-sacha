//
//  AudioRecorder.swift
//  TOMFrance.Sacha
//
//  Created by Jules Ducange on 15/07/2025.
//

import AVFoundation
import Combine

class AudioRecorder: NSObject, ObservableObject {
    private var audioRecorder: AVAudioRecorder?
    private var recordingSession = AVAudioSession.sharedInstance()
    
    @Published var isRecording = false
    @Published var hasPermission = false
    
    override init() {
        super.init()
        setupAudioSession()
    }
    
    func requestMicrophonePermission() {
        if #available(iOS 17.0, *) {
            AVAudioApplication.requestRecordPermission { [weak self] granted in
                DispatchQueue.main.async {
                    self?.hasPermission = granted
                    if !granted {
                        print("Microphone permission denied")
                    }
                }
            }
        } else {
            recordingSession.requestRecordPermission { [weak self] granted in
                DispatchQueue.main.async {
                    self?.hasPermission = granted
                    if !granted {
                        print("Microphone permission denied")
                    }
                }
            }
        }
    }
    
    private func setupAudioSession() {
        do {
            try recordingSession.setCategory(.playAndRecord, mode: .default, options: [.allowBluetooth])
            try recordingSession.setActive(true)
            print("Recording audio session configured successfully")
        } catch {
            print("Failed to set up recording session: \(error)")
        }
    }
    
    func startRecording() -> URL? {
        guard hasPermission else {
            print("Cannot record: Microphone permission not granted")
            return nil
        }
        
        do {
            try recordingSession.setCategory(.playAndRecord, mode: .default, options: [.allowBluetooth])
            try recordingSession.setActive(true)
        } catch {
            print("Failed to set up recording session: \(error)")
            return nil
        }
        
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let audioURL = documentsPath.appendingPathComponent("recording_\(Date().timeIntervalSince1970).wav")
        
        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatLinearPCM),
            AVSampleRateKey: 44100.0,
            AVNumberOfChannelsKey: 1,
            AVLinearPCMBitDepthKey: 16,
            AVLinearPCMIsBigEndianKey: false,
            AVLinearPCMIsFloatKey: false,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]
        
        do {
            audioRecorder = try AVAudioRecorder(url: audioURL, settings: settings)
            audioRecorder?.prepareToRecord()
            
            if audioRecorder?.record() == true {
                isRecording = true
                print("Recording started at: \(audioURL)")
                return audioURL
            } else {
                print("Failed to start recording")
                return nil
            }
        } catch {
            print("Could not start recording: \(error)")
            return nil
        }
    }
    
    func stopRecording() -> Data? {
        audioRecorder?.stop()
        isRecording = false
        
        do {
            try recordingSession.setCategory(.playAndRecord, mode: .default, options: [.allowBluetooth])
            try recordingSession.setActive(true)
        } catch {
            print("Failed to reset audio session: \(error)")
        }
        
        if let url = audioRecorder?.url {
            do {
                let data = try Data(contentsOf: url)
                print("Recording stopped, data size: \(data.count) bytes")
                return data
            } catch {
                print("Could not read audio data: \(error)")
                return nil
            }
        }
        return nil
    }
}
