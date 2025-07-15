//
//  AudioView.swift
//  TOMFrance.Sacha
//
//  Created by Jules Ducange on 15/07/2025.
//

import SwiftUI
import AVFoundation

struct AudioView: View {
    @StateObject private var recorder = AudioRecorder()
    @StateObject private var player = AudioPlayer()
    @State private var recordedData: Data?
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Audio Recorder")
                .font(.title)
                .padding()
            
            // Recording Controls
            HStack {
                Button(action: {
                    if recorder.isRecording {
                        recordedData = recorder.stopRecording()
                    } else {
                        if let _ = recorder.startRecording() {
                            recordedData = nil
                        }
                    }
                }) {
                    Text(recorder.isRecording ? "Stop Recording" : "Start Recording")
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(recorder.isRecording ? Color.red : recorder.hasPermission ? Color.green : Color.gray)
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .disabled(player.isPlaying || !recorder.hasPermission)
            }
            .padding(.horizontal)
            
            // Playback Controls
            HStack {
                Button(action: {
                    if player.isPlaying {
                        player.stopAudio()
                    } else if let data = recordedData {
                        player.playAudio(from: data)
                    }
                }) {
                    Text(player.isPlaying ? "Stop Playback" : "Play Recording")
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(recordedData == nil || player.isPlaying ? Color.gray : Color.blue)
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .disabled(recordedData == nil || recorder.isRecording)
            }
            .padding(.horizontal)
            
            // Status Indicators
            Text(recorder.isRecording ? "Recording..." : recorder.hasPermission ? "Not Recording" : "Microphone Permission Denied")
                .foregroundColor(recorder.isRecording ? .red : recorder.hasPermission ? .gray : .orange)
            
            Text(player.isPlaying ? "Playing..." : recordedData == nil ? "No Recording Available" : "Ready to Play")
                .foregroundColor(player.isPlaying ? .blue : recordedData == nil ? .gray : .black)
            
            Spacer()
        }
        .padding()
        .onAppear {
            // Request permission via AudioRecorder
            recorder.requestMicrophonePermission()
        }
    }
}

struct AudioView_Previews: PreviewProvider {
    static var previews: some View {
        AudioView()
    }
}
