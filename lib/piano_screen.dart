import 'package:flutter/cupertino.dart';
import 'dart:math';

class PianoScreen extends StatefulWidget {
  const PianoScreen({super.key});

  @override
  State<PianoScreen> createState() => _PianoScreenState();
}

class _PianoScreenState extends State<PianoScreen> {
  final List<String> whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  final List<String> blackKeys = ['C#', 'D#', '', 'F#', 'G#', 'A#', ''];

  // Word to spell
  final String targetWord = 'animal';
  Map<String, String> keyLetters = {}; // Maps note to letter
  String typedWord = '';

  @override
  void initState() {
    super.initState();
    _assignRandomLetters();
  }

  void _assignRandomLetters() {
    keyLetters = {};
    List<String> letters = targetWord.toUpperCase().split('');
    Random random = Random();

    // Get all available keys (white + non-empty black keys)
    List<String> allKeys = [...whiteKeys];
    for (String blackKey in blackKeys) {
      if (blackKey.isNotEmpty) {
        allKeys.add(blackKey);
      }
    }

    print('Available keys: $allKeys');
    print('Letters to assign: $letters');

    // Assign each letter to a random key
    for (String letter in letters) {
      String availableKey = allKeys[random.nextInt(allKeys.length)];
      keyLetters[availableKey] = letter;
      allKeys.remove(availableKey); // Remove to avoid duplicates
      print('Assigned letter "$letter" to key "$availableKey"');
    }

    print('Final keyLetters map: $keyLetters');
  }

  void _playNote(String note) {
    print('Playing note: $note');

    // Check if this key has a letter assigned
    if (keyLetters.containsKey(note)) {
      String pressedLetter = keyLetters[note]!;
      String expectedLetter = targetWord.toUpperCase()[typedWord.length];

      setState(() {
        // Check if the pressed letter is the next expected letter in sequence
        if (pressedLetter == expectedLetter) {
          typedWord += pressedLetter.toLowerCase();

          // Check if word is complete
          if (typedWord == targetWord) {
            _showSuccessDialog();
          }
        } else {
          // Wrong letter pressed, reset the word
          typedWord = '';
          // Show feedback that it was wrong
          _showWrongLetterFeedback(pressedLetter, expectedLetter);
        }
      });
    }
  }

  void _showWrongLetterFeedback(String pressed, String expected) {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Try Again!'),
        content: Text('You pressed "$pressed" but the next letter should be "$expected".\nLet\'s start over!'),
        actions: [
          CupertinoDialogAction(
            child: const Text('OK'),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Success!'),
        content: Text('You spelled "$targetWord" correctly!'),
        actions: [
          CupertinoDialogAction(
            child: const Text('Play Again'),
            onPressed: () {
              Navigator.of(context).pop();
              setState(() {
                typedWord = '';
                _assignRandomLetters();
              });
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text('Piano'),
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Text input display
            Container(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Text(
                    'Find and press the letters in order!',
                    style: const TextStyle(
                      fontSize: 14,
                      color: CupertinoColors.systemGrey,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(
                      border: Border.all(color: CupertinoColors.systemGrey4),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          typedWord.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w500,
                            color: CupertinoColors.systemGreen,
                          ),
                        ),
                        if (typedWord.length < targetWord.length)
                          Text(
                            targetWord.substring(typedWord.length).toUpperCase(),
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w300,
                              color: CupertinoColors.systemGrey3,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            // Piano keys
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(20),
                child: Stack(
                  children: [
                    // White keys
                    Row(
                      children: whiteKeys.map((note) {
                        return Expanded(
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 1),
                            child: CupertinoButton(
                              onPressed: () => _playNote(note),
                              padding: EdgeInsets.zero,
                              child: Container(
                                height: 200,
                                decoration: BoxDecoration(
                                  color: CupertinoColors.white,
                                  border: Border.all(color: CupertinoColors.systemGrey4),
                                  borderRadius: const BorderRadius.only(
                                    bottomLeft: Radius.circular(8),
                                    bottomRight: Radius.circular(8),
                                  ),
                                ),
                                child: Center(
                                  child: Padding(
                                    padding: const EdgeInsets.only(top: 120),
                                    child: Text(
                                      keyLetters[note] ?? '',
                                      style: const TextStyle(
                                        color: CupertinoColors.black,
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    // Black keys
                    Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      child: Row(
                        children: blackKeys.asMap().entries.map((entry) {
                          int index = entry.key;
                          String note = entry.value;

                          if (note.isEmpty) {
                            return Expanded(child: Container());
                          }

                          return Expanded(
                            child: Container(
                              margin: EdgeInsets.only(
                                left: index == 0 ? 20 : 10,
                                right: 10,
                              ),
                              child: CupertinoButton(
                                onPressed: () => _playNote(note),
                                padding: EdgeInsets.zero,
                                child: Container(
                                  height: 120,
                                  decoration: BoxDecoration(
                                    color: CupertinoColors.black,
                                    borderRadius: const BorderRadius.only(
                                      bottomLeft: Radius.circular(6),
                                      bottomRight: Radius.circular(6),
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      keyLetters[note] ?? '',
                                      style: const TextStyle(
                                        color: CupertinoColors.white,
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
