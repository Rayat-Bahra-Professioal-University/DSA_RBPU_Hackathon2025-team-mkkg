# 📸 Screenshots Guide

This folder contains screenshots for the CityCare project README.

## 📋 Required Screenshots

Please capture the following screenshots and save them with the exact filenames listed below:

### 🏠 User Interface Screenshots

1. **landing-page.png**

   - Capture: Home/Landing page
   - Show: Hero section, navigation, call-to-action
   - Resolution: 1920x1080 (Full HD)

2. **user-dashboard.png**

   - Capture: User dashboard after login
   - Show: Statistics cards, recent complaints, overview
   - Resolution: 1920x1080

3. **create-complaint.png**

   - Capture: Create Issue form
   - Show: All form fields, upload buttons, camera button, map
   - Resolution: 1920x1080

4. **issue-sitemap.png**

   - Capture: Issue Sitemap page with map
   - Show: Interactive map with markers and heat zones
   - Resolution: 1920x1080

5. **complaint-details.png**

   - Capture: Single complaint detail view
   - Show: Issue information, photos, status, location
   - Resolution: 1920x1080

6. **search-complaints.png**
   - Capture: Search & Filter page
   - Show: Search bar, filters, results
   - Resolution: 1920x1080

### 👨‍💼 Admin Interface Screenshots

7. **admin-dashboard.png**

   - Capture: Admin dashboard
   - Show: Statistics, complaint list, filters
   - Resolution: 1920x1080

8. **status-management.png**

   - Capture: Admin updating complaint status
   - Show: Status dropdown, admin notes, action buttons
   - Resolution: 1920x1080

9. **resolution-photos.png**

   - Capture: Admin uploading resolution photos
   - Show: Camera modal or photo upload interface
   - Resolution: 1920x1080

10. **assign-issues.png**

    - Capture: Assign Issues page
    - Show: Issue list, assign dropdown, admin selection
    - Resolution: 1920x1080

11. **manage-admins.png**
    - Capture: Manage Admins page
    - Show: Admin list, add/remove buttons, roles
    - Resolution: 1920x1080

### 📱 Mobile Screenshots

12. **mobile-home.png**

    - Capture: Landing page on mobile view
    - Device: Mobile (375x667 or similar)
    - Tool: Use browser DevTools mobile view

13. **mobile-dashboard.png**

    - Capture: User dashboard on mobile
    - Device: Mobile (375x667 or similar)

14. **mobile-create.png**
    - Capture: Create Issue form on mobile
    - Device: Mobile (375x667 or similar)

## 🛠️ How to Capture Screenshots

### Method 1: Using Browser (Recommended)

1. **Run your application**

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Open in browser**: Navigate to `http://localhost:5173`

3. **For Desktop Screenshots**:

   - Windows: `Win + Shift + S` or Snipping Tool
   - Mac: `Cmd + Shift + 4`
   - Chrome: Press `F12` → `Ctrl + Shift + P` → Type "screenshot" → Select "Capture full size screenshot"

4. **For Mobile Screenshots**:
   - Press `F12` to open DevTools
   - Click the mobile device icon (Toggle device toolbar)
   - Select a mobile device (e.g., iPhone 12 Pro)
   - Take screenshot using method above

### Method 2: Using Browser Extensions

- **Awesome Screenshot** (Chrome/Firefox)
- **Nimbus Screenshot** (Chrome)
- **Fireshot** (Chrome/Firefox)

### Method 3: Professional Tools

- **Lightshot** (Windows/Mac)
- **Greenshot** (Windows)
- **Skitch** (Mac)

## ✨ Screenshot Tips

### Quality Guidelines

- ✅ **Resolution**: Use 1920x1080 for desktop, 375x667 for mobile
- ✅ **Format**: PNG (better quality) or JPG
- ✅ **File Size**: Keep under 500KB per image (optimize if needed)
- ✅ **Content**: Show real data, not lorem ipsum
- ✅ **State**: Capture in a clean, bug-free state
- ✅ **Lighting**: Use light theme for better visibility

### What to Show

- ✅ Include realistic complaint data
- ✅ Show features in action (map with markers, heat zones visible)
- ✅ Display statistics with numbers
- ✅ Include photos in complaint cards
- ✅ Show status badges (Pending, In Progress, Closed)

### What to Avoid

- ❌ Empty states (no data)
- ❌ Console errors visible
- ❌ Placeholder text everywhere
- ❌ Broken images or layouts
- ❌ Sensitive information (real user data)
- ❌ Low resolution or blurry images

## 📊 Image Optimization (Optional)

If your images are too large, optimize them:

### Online Tools

- [TinyPNG](https://tinypng.com/) - Compress PNG images
- [Squoosh](https://squoosh.app/) - Google's image compressor
- [ImageOptim](https://imageoptim.com/) - Mac app

### Command Line (if you have ImageMagick)

```bash
# Resize image
magick input.png -resize 1920x1080 output.png

# Compress
magick input.png -quality 85 output.png
```

## 📝 Naming Convention

**Important:** Use exact filenames as listed above!

```
✅ Correct:  landing-page.png
❌ Wrong:    Landing_Page.PNG
❌ Wrong:    landingPage.png
❌ Wrong:    landing page.png
```

## 🎨 Sample Data

Before taking screenshots, ensure you have:

- [ ] At least 5-10 complaints created
- [ ] Complaints in different statuses (Pending, In Progress, Closed)
- [ ] Multiple complaints in same area (to show heat zones)
- [ ] Complaints with photos attached
- [ ] At least 2 admin users
- [ ] Some assigned issues
- [ ] Realistic complaint descriptions

## ✅ Checklist

After capturing all screenshots:

- [ ] All 14 screenshots captured
- [ ] Filenames match exactly
- [ ] Images are clear and readable
- [ ] No sensitive information visible
- [ ] File sizes are reasonable (<500KB each)
- [ ] Images show the application in best light
- [ ] Mobile screenshots show responsive design
- [ ] All features are properly visible

## 🚀 After Completion

Once all screenshots are in this folder:

1. Verify they display correctly in the main README
2. Commit and push to GitHub
3. Check how they appear on GitHub (images might look different)
4. Adjust if needed

---

**Need Help?**

If you're having trouble capturing screenshots, you can:

- Use placeholder images temporarily
- Ask team members to help
- Use stock images as reference (but replace with real ones later)

---

_Happy Screenshot Taking! 📸_
