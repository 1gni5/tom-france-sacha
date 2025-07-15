//
//  HomePageView.swift
//  TOMFrance.Sacha
//
//  Created by Pierre Alexis Valbrun on 15/07/2025.
//

import SwiftUI

struct HomePageView: View {
    @State private var selectedLevel: Int = 1
    @State private var unlockedLevels: Int = 4 // Example: first 5 levels are unlocked
    
    let totalLevels = 20 // Total number of levels
    
    var body: some View {
        VStack {
            Text("TOM France Sacha")
                .font(.largeTitle)
                .fontWeight(.bold)
                .padding(.top, 40)
            
            Text("Level Progression")
                .font(.title2)
                .foregroundColor(.secondary)
                .padding(.bottom, 30)
            
            Spacer()
            
            // Scrollable level progression
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 0) {
                    ForEach(1...totalLevels, id: \.self) { level in
                        HStack(spacing: 0) {
                            // Level Circle
                            LevelCircleView(
                                level: level,
                                isSelected: selectedLevel == level,
                                isUnlocked: level <= unlockedLevels,
                                action: {
                                    if level <= unlockedLevels {
                                        selectedLevel = level
                                        print("Level \(level) selected")
                                    }
                                }
                            )
                            
                            // Connecting Line (don't show after last level)
                            if level < totalLevels {
                                Rectangle()
                                    .fill(level < unlockedLevels ? Color.blue : Color.gray.opacity(0.3))
                                    .frame(width: 30, height: 4)
                            }
                        }
                    }
                }
                .padding(.horizontal, 30)
            }
            .padding(.vertical, 20)
            
            // Selected level info
            VStack(spacing: 10) {
                Text("Level \(selectedLevel)")
                    .font(.title)
                    .fontWeight(.bold)
                
                if selectedLevel <= unlockedLevels {
                    Button("Start Level") {
                        print("Starting level \(selectedLevel)")
                    }
                    .buttonStyle(.borderedProminent)
                    .padding(.top, 10)
                } else {
                    Text("Complete previous levels to unlock")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding(.top, 10)
                }
            }
            .padding(.top, 30)
            
            Spacer()
        }
        .background(Color(.systemGroupedBackground))
    }
}

struct LevelCircleView: View {
    let level: Int
    let isSelected: Bool
    let isUnlocked: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(backgroundColor)
                    .frame(width: 60, height: 60)
                    .overlay(
                        Circle()
                            .stroke(borderColor, lineWidth: isSelected ? 4 : 2)
                    )
                    .padding(.vertical, 20)
                    .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                
                if isUnlocked {
                    Text("\(level)")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(textColor)
                } else {
                    Image(systemName: "lock.fill")
                        .font(.title3)
                        .foregroundColor(.gray)
                }
            }
        }
        .disabled(!isUnlocked)
        .scaleEffect(isSelected ? 1.1 : 1.0)
        .animation(.easeInOut(duration: 0.2), value: isSelected)
    }
    
    private var backgroundColor: Color {
        if !isUnlocked {
            return Color.gray.opacity(0.2)
        } else if isSelected {
            return Color.blue
        } else {
            return Color(.systemBackground)
        }
    }
    
    private var borderColor: Color {
        if !isUnlocked {
            return Color.gray.opacity(0.3)
        } else if isSelected {
            return Color.blue
        } else {
            return Color.blue.opacity(0.6)
        }
    }
    
    private var textColor: Color {
        if isSelected {
            return .white
        } else {
            return .primary
        }
    }
}

struct HomePageView_Previews: PreviewProvider {
    static var previews: some View {
        HomePageView()
            .previewInterfaceOrientation(.landscapeLeft)
    }
}
