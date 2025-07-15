import 'dart:io';

import 'package:flutter/cupertino.dart';

class DisplayPictureScreen extends StatelessWidget {
  final String imagePath;

  const DisplayPictureScreen({super.key, required this.imagePath});

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text('Display the Picture'),
      ),
      child: Center(
        child: Image.file(File(imagePath)),
      ),
    );
  }
}
