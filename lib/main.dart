import 'package:camera/camera.dart';
import 'package:flutter/cupertino.dart';
import 'package:tom_france_sacha/take_pictures_screen.dart';
import 'package:tom_france_sacha/no_camera_screen.dart';

Future<void> main() async {
  // Ensure that plugin services are initialized so that `availableCameras()`
  // can be called before `runApp()`
  WidgetsFlutterBinding.ensureInitialized();

  // Obtain a list of the available cameras on the device.
  final cameras = await availableCameras();

  // Check if any cameras are available
  if (cameras.isEmpty) {
    runApp(MyApp(camera: null));
    return;
  }

  // Get a specific camera from the list of available cameras.
  final firstCamera = cameras.first;

  runApp(MyApp(camera: firstCamera));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key, this.camera});

  final CameraDescription? camera;

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return CupertinoApp(
      title: 'Flutter Demo',
      theme: const CupertinoThemeData(
        primaryColor: CupertinoColors.systemBlue,
      ),
      home: camera != null
          ? TakePictureScreen(camera: camera!)
          : const NoCameraScreen(),
    );
  }
}


