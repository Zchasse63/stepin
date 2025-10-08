# Watchman Configuration Guide

**Project**: Stepin Walking Tracker App  
**Last Updated**: October 8, 2025

---

## Overview

Watchman is a file watching service used by Metro bundler (React Native/Expo) to detect file changes and trigger hot reloads. Proper configuration is essential for performance and reliability.

---

## Current Issue

During testing, we discovered Watchman was watching the entire `/Users/zach` directory instead of just the project directory. This causes:
- Performance degradation
- Unnecessary file system monitoring
- Potential conflicts with other projects
- Slower hot reload times

---

## Recommended Configuration

### 1. Create `.watchmanconfig` File

Create a `.watchmanconfig` file in the project root (`Desktop/Steppin/stepin-app/`):

```json
{
  "ignore_dirs": [
    "node_modules",
    ".expo",
    ".git",
    "ios/build",
    "ios/Pods",
    "android/build",
    "android/.gradle",
    ".maestro",
    "coverage",
    "dist",
    "build"
  ],
  "settle": 20
}
```

**Explanation**:
- `ignore_dirs`: Directories to exclude from watching
- `settle`: Milliseconds to wait for file system to settle before triggering (reduces false positives)

### 2. Reset Watchman Watches

After creating the config file, reset Watchman:

```bash
# Stop watchman
watchman shutdown-server

# Clear all watches
watchman watch-del-all

# Restart watchman (it will auto-start when needed)
# No command needed - it starts automatically
```

### 3. Verify Configuration

Check that Watchman is only watching the project directory:

```bash
# List all watched directories
watchman watch-list

# Expected output:
# {
#     "version": "2025.04.28.00",
#     "roots": [
#         "/Users/zach/Desktop/Steppin/stepin-app"
#     ]
# }
```

If you see `/Users/zach` or other directories, run:

```bash
watchman watch-del /Users/zach
watchman watch-del-all
```

---

## Project Location Best Practices

### Current Location
`/Users/zach/Desktop/Steppin/stepin-app`

### Is This Location Problematic?

**Short Answer**: No, but there are better options.

**Analysis**:
- ✅ **Works fine**: Desktop is a valid location for development
- ⚠️ **Potential issues**:
  - Desktop is synced by iCloud (can cause file conflicts)
  - Desktop is backed up by Time Machine (extra I/O)
  - Longer path can cause issues on Windows (not relevant for Mac)

### Recommended Locations

#### Option 1: Home Directory Projects Folder (RECOMMENDED)
```
/Users/zach/Projects/Steppin/stepin-app
```

**Pros**:
- Standard convention
- Not synced by iCloud
- Easy to backup selectively
- Clean organization

**Setup**:
```bash
mkdir -p ~/Projects
mv ~/Desktop/Steppin ~/Projects/
```

#### Option 2: Developer Directory
```
/Users/zach/Developer/Steppin/stepin-app
```

**Pros**:
- Xcode's default location
- Recognized by macOS as development directory
- Good for iOS/Mac development

#### Option 3: Keep Current Location
```
/Users/zach/Desktop/Steppin/stepin-app
```

**Pros**:
- No migration needed
- Easy to access
- Works fine for most cases

**Cons**:
- iCloud sync can interfere
- Desktop clutter

---

## Industry Best Practices

### 1. Directory Structure

**Recommended**:
```
~/Projects/
├── Steppin/
│   ├── stepin-app/          # Mobile app
│   ├── stepin-backend/      # Backend (if separate)
│   └── stepin-docs/         # Documentation
```

**Why**:
- Clear separation of concerns
- Easy to manage multiple related projects
- Consistent with team workflows

### 2. Excluded Directories

Always exclude from file watching:

**Build Artifacts**:
- `ios/build/`
- `ios/Pods/`
- `android/build/`
- `android/.gradle/`
- `.expo/`
- `dist/`
- `build/`

**Dependencies**:
- `node_modules/` (largest directory, changes frequently)

**Version Control**:
- `.git/`

**Test Artifacts**:
- `coverage/`
- `.maestro/`
- `__tests__/__snapshots__/`

**IDE Files**:
- `.vscode/`
- `.idea/`

### 3. Watchman Performance Tuning

For large projects, add to `.watchmanconfig`:

```json
{
  "ignore_dirs": [
    "node_modules",
    ".expo",
    ".git",
    "ios/build",
    "ios/Pods",
    "android/build",
    "android/.gradle",
    ".maestro",
    "coverage"
  ],
  "settle": 20,
  "fsevents_latency": 0.01,
  "fsevents_try_resync": true
}
```

**Additional Options**:
- `fsevents_latency`: How quickly to respond to file changes (macOS only)
- `fsevents_try_resync`: Attempt to recover from file system errors

---

## Troubleshooting

### Issue: Watchman Watching Wrong Directory

**Symptoms**:
- `watchman watch-list` shows `/Users/zach` or other directories
- Slow hot reload
- High CPU usage

**Solution**:
```bash
# Remove all watches
watchman watch-del-all

# Shutdown watchman
watchman shutdown-server

# Clear watchman cache
rm -rf /usr/local/var/run/watchman/$USER-state

# Restart your dev server
npx expo start
```

### Issue: Hot Reload Not Working

**Symptoms**:
- File changes don't trigger reload
- Need to manually refresh

**Solution**:
```bash
# Check watchman is running
watchman version

# Check project is being watched
watchman watch-list

# If not listed, manually add watch
watchman watch /Users/zach/Desktop/Steppin/stepin-app

# Restart dev server
npx expo start
```

### Issue: "Too Many Open Files" Error

**Symptoms**:
- Watchman crashes
- Error: "EMFILE: too many open files"

**Solution**:
```bash
# Increase file descriptor limit (macOS)
ulimit -n 10240

# Make permanent by adding to ~/.zshrc or ~/.bash_profile:
echo "ulimit -n 10240" >> ~/.zshrc

# Restart terminal and watchman
watchman shutdown-server
```

---

## Verification Commands

### Check Watchman Status
```bash
# Version
watchman version

# List watched directories
watchman watch-list

# Get watch info for specific directory
watchman watch-project /Users/zach/Desktop/Steppin/stepin-app

# Check watchman logs
tail -f /usr/local/var/run/watchman/$USER-state/log
```

### Monitor File Changes
```bash
# Watch for file changes in real-time
watchman -j <<-EOT
["subscribe", "/Users/zach/Desktop/Steppin/stepin-app", "mysubscription", {
  "expression": ["allof", ["type", "f"], ["not", "empty"]],
  "fields": ["name", "size", "mtime"]
}]
EOT
```

---

## Recommended Actions for This Project

### Immediate Actions

1. **Create `.watchmanconfig`**:
```bash
cd /Users/zach/Desktop/Steppin/stepin-app
cat > .watchmanconfig << 'EOF'
{
  "ignore_dirs": [
    "node_modules",
    ".expo",
    ".git",
    "ios/build",
    "ios/Pods",
    "android/build",
    "android/.gradle",
    ".maestro",
    "coverage",
    "dist",
    "build"
  ],
  "settle": 20
}
EOF
```

2. **Reset Watchman**:
```bash
watchman watch-del-all
watchman shutdown-server
```

3. **Restart Dev Server**:
```bash
npx expo start --clear
```

### Optional: Move Project

If you want to follow best practices:

```bash
# Create Projects directory
mkdir -p ~/Projects

# Move project
mv ~/Desktop/Steppin ~/Projects/

# Update any absolute paths in your code/config
# (Most Expo projects use relative paths, so this should be safe)

# Restart dev server from new location
cd ~/Projects/Steppin/stepin-app
npx expo start
```

---

## Additional Resources

- [Watchman Documentation](https://facebook.github.io/watchman/)
- [Metro Bundler Configuration](https://metrobundler.dev/docs/configuration)
- [Expo File System Watching](https://docs.expo.dev/guides/customizing-metro/)
- [React Native Performance](https://reactnative.dev/docs/performance)

---

## Summary

**Key Takeaways**:
1. ✅ Create `.watchmanconfig` to exclude unnecessary directories
2. ✅ Reset watchman watches to remove `/Users/zach` watch
3. ✅ Current location (Desktop) works but `~/Projects` is better
4. ✅ Always exclude `node_modules`, `.expo`, `ios/build`, etc.
5. ✅ Verify configuration with `watchman watch-list`

**Next Steps**:
1. Create `.watchmanconfig` file
2. Reset watchman
3. Verify only project directory is watched
4. (Optional) Move project to `~/Projects/`

