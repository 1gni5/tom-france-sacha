import SwiftUI
import RealmSwift
import AVFoundation

// MARK: - Realm Model
class Word: Object, ObjectKeyIdentifiable {
    @Persisted var id = UUID().uuidString
    @Persisted var text: String = ""
    @Persisted var tag: String = ""
    @Persisted var audioData: Data?
    @Persisted var createdAt = Date()
    
    override static func primaryKey() -> String? {
        return "id"
    }
}

// MARK: - Audio Manager
class AudioManager: NSObject, ObservableObject, AVAudioPlayerDelegate {
    private var audioPlayer: AVAudioPlayer?
    private var audioRecorder: AVAudioRecorder?
    private var recordingSession = AVAudioSession.sharedInstance()
    
    @Published var isRecording = false
    @Published var isPlaying = false
    
    override init() {
        super.init()
        setupAudioSession()
    }
    
    private func setupAudioSession() {
        do {
            try recordingSession.setCategory(.playAndRecord, mode: .default, options: [ .allowBluetooth])
            try recordingSession.setActive(true)
            print("Audio session configured successfully")
        } catch {
            print("Failed to set up recording session: \(error)")
        }
    }
    
    func startRecording() -> URL? {
        // Set up audio session for recording
        do {
            try recordingSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
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
        
        // Reset audio session for playback
        do {
            try recordingSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
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
    
    func playAudio(from data: Data) {
        stopAudio() // Stop any current playback
        
        // Validate data
        guard data.count > 0 else {
            print("Audio data is empty")
            return
        }
        
        do {
            // Set up audio session for playback
            try recordingSession.setCategory(.playback, mode: .default, options: [.defaultToSpeaker])
            try recordingSession.setActive(true)
            
            // Create a temporary file for playback
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
            // Try alternative approach with data directly
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
    
    // MARK: - AVAudioPlayerDelegate
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

// MARK: - Word Manager
class WordManager: ObservableObject {
    private let realm: Realm
    @Published var words: Results<Word>
    
    init() {
        realm = try! Realm()
        words = realm.objects(Word.self).sorted(byKeyPath: "createdAt", ascending: false)
    }
    
    private func clearRealmIfNeeded() {
        do {
            let realm = try Realm()
            try realm.write {
                realm.deleteAll()
            }
            print("Realm data cleared successfully")
        } catch {
            print("Error clearing Realm: \(error)")
            // If clearing fails, delete the file
            deleteRealmFile()
        }
    }
    
    private func deleteRealmFile() {
        do {
            let realmURL = Realm.Configuration.defaultConfiguration.fileURL!
            let realmURLs = [
                realmURL,
                realmURL.appendingPathExtension("lock"),
                realmURL.appendingPathExtension("note"),
                realmURL.appendingPathExtension("management")
            ]
            
            for URL in realmURLs {
                try FileManager.default.removeItem(at: URL)
            }
            print("Realm file deleted successfully")
        } catch {
            print("Error deleting Realm file: \(error)")
        }
    }
    
    func addWord(text: String, tag: String, audioData: Data?) {
        let word = Word()
        word.text = text
        word.tag = tag
        word.audioData = audioData
        
        do {
            try realm.write {
                realm.add(word)
            }
        } catch {
            print("Error adding word: \(error)")
        }
    }
    
    func deleteWord(_ word: Word) {
        do {
            try realm.write {
                realm.delete(word)
            }
        } catch {
            print("Error deleting word: \(error)")
        }
    }
    
    func updateWord(_ word: Word, text: String, tag: String, audioData: Data?) {
        do {
            try realm.write {
                word.text = text
                word.tag = tag
                if let audioData = audioData {
                    word.audioData = audioData
                }
            }
        } catch {
            print("Error updating word: \(error)")
        }
    }
}

// MARK: - Add Word View
struct AddWordView: View {
    @ObservedObject var wordManager: WordManager
    @ObservedObject var audioManager: AudioManager
    @Environment(\.presentationMode) var presentationMode
    
    @State private var text = ""
    @State private var tag = ""
    @State private var recordedAudioData: Data?
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                TextField("Enter word", text: $text)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                TextField("Enter tag", text: $tag)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                VStack {
                    Text("Audio Recording")
                        .font(.headline)
                    
                    HStack {
                        Button(action: {
                            if audioManager.isRecording {
                                recordedAudioData = audioManager.stopRecording()
                            } else {
                                _ = audioManager.startRecording()
                            }
                        }) {
                            Image(systemName: audioManager.isRecording ? "stop.circle.fill" : "mic.circle.fill")
                                .font(.system(size: 40))
                                .foregroundColor(audioManager.isRecording ? .red : .blue)
                        }
                        
                        if recordedAudioData != nil {
                            Button(action: {
                                audioManager.playAudio(from: recordedAudioData!)
                            }) {
                                Image(systemName: "play.circle.fill")
                                    .font(.system(size: 40))
                                    .foregroundColor(.green)
                            }
                        }
                    }
                    
                    if recordedAudioData != nil {
                        Text("Audio recorded ✓")
                            .foregroundColor(.green)
                            .font(.caption)
                    }
                }
                
                Spacer()
            }
            .padding()
            .navigationTitle("Add Word")
            .navigationBarItems(
                leading: Button("Cancel") {
                    presentationMode.wrappedValue.dismiss()
                },
                trailing: Button("Save") {
                    saveWord()
                }
                .disabled(text.isEmpty || tag.isEmpty)
            )
            .alert(isPresented: $showingAlert) {
                Alert(title: Text("Error"), message: Text(alertMessage), dismissButton: .default(Text("OK")))
            }
        }
    }
    
    private func saveWord() {
        guard !text.isEmpty, !tag.isEmpty else {
            alertMessage = "Please fill in all fields"
            showingAlert = true
            return
        }
        
        wordManager.addWord(text: text, tag: tag, audioData: recordedAudioData)
        presentationMode.wrappedValue.dismiss()
    }
}

// MARK: - Word Row View
struct WordRowView: View {
    let word: Word
    @ObservedObject var audioManager: AudioManager
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(word.text)
                    .font(.headline)
                
                Text(word.tag)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(8)
            }
            
            Spacer()
            
            if word.audioData != nil {
                Button(action: {
                    if audioManager.isPlaying {
                        audioManager.stopAudio()
                    } else {
                        audioManager.playAudio(from: word.audioData!)
                    }
                }) {
                    Image(systemName: audioManager.isPlaying ? "stop.circle.fill" : "play.circle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.blue)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Main Content View
struct ContentView: View {
    @StateObject private var wordManager = WordManager()
    @StateObject private var audioManager = AudioManager()
    @State private var showingAddWord = false
    
    var body: some View {
        NavigationView {
            VStack {
                if wordManager.words.isEmpty {
                    VStack {
                        Image(systemName: "text.bubble")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        Text("No words yet")
                            .font(.headline)
                            .foregroundColor(.gray)
                        Text("Tap + to add your first word")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    .padding()
                } else {
                    List {
                        ForEach(wordManager.words, id: \.id) { word in
                            WordRowView(word: word, audioManager: audioManager)
                        }
                        .onDelete(perform: deleteWords)
                    }
                }
            }
            .navigationTitle("Word Manager")
            .navigationBarItems(trailing: Button(action: {
                showingAddWord = true
            }) {
                Image(systemName: "plus")
            })
            .sheet(isPresented: $showingAddWord) {
                AddWordView(wordManager: wordManager, audioManager: audioManager)
            }
        }
    }
    
    private func deleteWords(offsets: IndexSet) {
        withAnimation {
            for index in offsets {
                wordManager.deleteWord(wordManager.words[index])
            }
        }
    }
}

// MARK: - Preview
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
