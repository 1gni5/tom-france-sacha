import 'package:flutter/cupertino.dart';

class HomePageScreen extends StatelessWidget {
  const HomePageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      child: SafeArea(
        child: Center(
          child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              spacing: 12,
              mainAxisSize: MainAxisSize.max,
              children: [
              Expanded(
                child: CardButton(
                  title: 'Mission du jour',
                  icon: CupertinoIcons.checkmark,
                  onPressed: () {},
                ),
              ),
              Expanded(
                child: CardButton(
                  title: 'Jeux en musique',
                  icon: CupertinoIcons.music_note,
                  onPressed: () {},
                ),
              ),
              Expanded(
                child: CardButton(
                  title: 'Damier des mots',
                  icon: CupertinoIcons.square_list,
                  onPressed: () {},
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CardButton extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback onPressed;

  const CardButton({
    super.key,
    required this.title,
    required this.icon,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 150,
      decoration: BoxDecoration(
        color: CupertinoColors.systemBackground,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: CupertinoColors.systemGrey.withOpacity(0.2),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: CupertinoButton(
        padding: EdgeInsets.zero,
        onPressed: onPressed,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 48,
              color: CupertinoColors.activeBlue,
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: CupertinoColors.label,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
