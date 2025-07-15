import 'package:flutter/cupertino.dart';
import 'package:tom_france_sacha/home_page_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoApp(
      title: 'Flutter Demo',
      theme: const CupertinoThemeData(
        primaryColor: CupertinoColors.systemPurple,
      ),
      home: const HomePageScreen(),
    );
  }
}
