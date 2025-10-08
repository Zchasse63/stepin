# Xcode Setup Instructions for Live Activities

## Overview
All Swift files have been created in the `stepin-app/ios/` directory. Follow these steps to add them to your Xcode project.

---

## Step 1: Create Widget Extension in Xcode

1. **Open Xcode**
   ```bash
   open Desktop/Steppin/stepin-app/ios/Stepin.xcworkspace
   ```

2. **Create Widget Extension Target**
   - In Xcode menu: **File → New → Target**
   - Select **Widget Extension**
   - Click **Next**

3. **Configure Widget Extension**
   - **Product Name**: `StepinLiveActivity`
   - **Team**: Select your development team
   - **Organization Identifier**: Should auto-fill as `com.stepin`
   - **Language**: **Swift**
   - ✅ Check **Include Live Activity**
   - ❌ Uncheck **Include Configuration Intent**
   - Click **Finish**

4. **Activate Scheme**
   - When prompted "Activate 'StepinLiveActivity' scheme?", click **Activate**

5. **Verify Bundle Identifier**
   - In Project Navigator, select **Stepin** project (top level)
   - Select **StepinLiveActivity** target
   - Go to **General** tab
   - Verify **Bundle Identifier** is: `com.stepin.app.StepinLiveActivity`
   - If not, change it to match exactly

---

## Step 2: Add Widget Extension to Main App

1. **Embed Widget Extension**
   - In Project Navigator, select **Stepin** project (top level)
   - Select **Stepin** app target (not StepinLiveActivity)
   - Go to **General** tab
   - Scroll to **Frameworks, Libraries, and Embedded Content**
   - Click **+** button
   - Find and select **StepinLiveActivity.appex**
   - Ensure it's set to **Embed & Sign**

---

## Step 3: Replace Generated Widget Files

Xcode created some default files. We need to replace them with our custom implementation.

### Files to Replace in StepinLiveActivity Target:

1. **Delete Generated Files** (if they exist):
   - Right-click on `StepinLiveActivityLiveActivity.swift` → **Delete** → **Move to Trash**
   - Right-click on `StepinLiveActivityBundle.swift` → **Delete** → **Move to Trash**
   - Keep `Assets.xcassets` and `Info.plist`

2. **Add Our Custom Files**:
   - In Xcode, right-click on **StepinLiveActivity** folder in Project Navigator
   - Select **Add Files to "Stepin"...**
   - Navigate to: `Desktop/Steppin/stepin-app/ios/StepinLiveActivity/`
   - Select ALL files:
     - `StepinWalkAttributes.swift`
     - `StepinLiveActivity.swift`
     - `PauseWalkIntent.swift`
     - `EndWalkIntent.swift`
   - ✅ Check **Copy items if needed**
   - ✅ Check **Create groups**
   - Under **Add to targets**, check **StepinLiveActivity** ONLY
   - Click **Add**

---

## Step 4: Add Bridge Module Files to Main App

1. **Add Bridge Files to Main App Target**:
   - In Xcode, right-click on **Stepin** folder (main app) in Project Navigator
   - Select **Add Files to "Stepin"...**
   - Navigate to: `Desktop/Steppin/stepin-app/ios/`
   - Select:
     - `StepinLiveActivityModule.swift`
     - `StepinLiveActivityModule.m`
   - ✅ Check **Copy items if needed**
   - ✅ Check **Create groups**
   - Under **Add to targets**, check **Stepin** ONLY (NOT StepinLiveActivity)
   - Click **Add**

2. **Create Bridging Header** (if prompted):
   - If Xcode asks "Would you like to configure an Objective-C bridging header?", click **Create Bridging Header**
   - If not prompted, the bridging header already exists

---

## Step 5: Configure Build Settings

### For StepinLiveActivity Target:

1. Select **Stepin** project → **StepinLiveActivity** target
2. Go to **Build Settings** tab
3. Search for "iOS Deployment Target"
4. Set **iOS Deployment Target** to **16.1** or higher (Live Activities require iOS 16.1+)

### For Main Stepin Target:

1. Select **Stepin** project → **Stepin** target
2. Go to **Build Settings** tab
3. Search for "iOS Deployment Target"
4. Ensure it's set to **16.1** or higher

---

## Step 6: Verify Info.plist

1. **Main App Info.plist**:
   - In Project Navigator, find `Stepin/Info.plist`
   - Verify it contains:
     ```xml
     <key>NSSupportsLiveActivities</key>
     <true/>
     ```
   - This should already be there from our app.json configuration

---

## Step 7: Build and Test

1. **Clean Build Folder**:
   - In Xcode menu: **Product → Clean Build Folder** (Shift + Cmd + K)

2. **Build the Project**:
   - Select **Stepin** scheme (not StepinLiveActivity)
   - Select a physical iOS device with iOS 16.1+ (Live Activities don't work in simulator)
   - Click **Build** (Cmd + B)

3. **Check for Errors**:
   - If you see any errors, check:
     - All files are added to correct targets
     - Bundle identifiers are correct
     - iOS Deployment Target is 16.1+
     - Bridging header is configured

---

## Expected File Structure

After completing these steps, your Xcode project should look like:

```
Stepin (project)
├── Stepin (main app target)
│   ├── AppDelegate.swift
│   ├── StepinLiveActivityModule.swift ← Added
│   ├── StepinLiveActivityModule.m ← Added
│   └── ... (other app files)
│
└── StepinLiveActivity (widget target)
    ├── StepinWalkAttributes.swift ← Added
    ├── StepinLiveActivity.swift ← Added
    ├── PauseWalkIntent.swift ← Added
    ├── EndWalkIntent.swift ← Added
    ├── Assets.xcassets
    └── Info.plist
```

---

## Troubleshooting

### "Cannot find 'Activity' in scope"
- Ensure iOS Deployment Target is 16.1+
- ActivityKit is only available on iOS 16.1+

### "No such module 'ActivityKit'"
- Clean build folder and rebuild
- Verify iOS Deployment Target

### "Undefined symbol: _OBJC_CLASS_$_LiveActivityModule"
- Ensure `StepinLiveActivityModule.m` is added to **Stepin** target (not widget target)
- Check that bridging header is configured

### Build succeeds but Live Activity doesn't appear
- Live Activities only work on physical devices, not simulator
- Ensure device is running iOS 16.1+
- Check that `NSSupportsLiveActivities` is in Info.plist

---

## Next Steps

Once Xcode setup is complete and the project builds successfully:

1. ✅ Mark Xcode tasks as complete
2. Continue with TypeScript integration (Live Activity Manager)
3. Integrate with Active Walk Store
4. Add UI to Today screen
5. Test on physical device

---

## Questions?

If you encounter any issues during Xcode setup, let me know and I can help troubleshoot!

