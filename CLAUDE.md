# Zhao Zhou Portfolio Website - Technical Documentation

## Overview
This is a portfolio website for artist Zhao Zhou, showcasing installations and exhibitions focused on air-based sensory disruption and spatial experience.

## Current Status & Architecture

### ✅ **Well-Structured Pages (DO NOT MODIFY STYLING)**
These pages follow the preferred modern structure and should only receive structural efficiency improvements:

- `/works/borabora.html` - **REFERENCE TEMPLATE** 
- `/about.html`
- `/exhibitions.html` 
- `/contact.html`
- `/index.html`

**Standard Structure Features:**
- Uses `stijl.css` (modern CSS framework)
- Proper DOCTYPE, meta tags, favicon
- Consistent header with `class="header"` and navigation
- Footer with contact information
- Script loading order: navigation.js → three.js → desktopMenu.js → fogMenu.js → main.js → lastUpdated.js → analytics

### ❌ **Legacy Pages (NEED STRUCTURAL UPDATES)**
These pages use outdated structure and need to be migrated to the modern template:

- `/projects/*` - **ENTIRE DIRECTORY SHOULD BE REMOVED**
- `/works/caketin.html` - Incomplete, needs proper structure
- `/works.html` - Placeholder page, needs to become proper index

### 🎨 **CSS Framework**
- **Primary:** `stijl.css` - Modern, responsive framework with CSS variables
- **Legacy:** `styles.css` - Outdated, should be completely removed
- **External:** Adobe Typekit fonts (`jnl8xmf.css`)

### ⚠️ **Critical CSS Settings**
**VIDEO DISPLAY**: Two different treatments for video types:
- **Native HTML5 videos** (`<video>`): Use `height: auto` for natural proportions without letterboxing
- **Embedded videos** (`<iframe>`): Use `aspect-ratio: 16 / 9` to prevent collapse and maintain proper size
- **Media spacing**: Use `.media-gallery` and `.media-item` wrappers for consistent spacing between all media types

**DARK THEME SYSTEM**: Adaptive time-based theme switching implemented:
- **Auto Mode**: Automatically switches to dark theme during evening hours (6 PM - 6 AM)
- **Manual Override**: Users can manually toggle theme with ◐/◑ button in header
- **Persistence**: User preferences saved in localStorage
- **CSS Variables**: All colors use CSS custom properties for seamless theme switching
- **Files**: `themeManager.js` handles all theme logic, CSS variables in `stijl.css`

**SEAMLESS NAVIGATION**: Simple, effective solution targeting the root cause:
- **Theme-Aware Loader**: `#loader` background matches current theme (was hardcoded white!)
- **Immediate Loader Theming**: Inline scripts apply correct loader background before content renders
- **Static Header Caching**: Navigation header stays completely static during transitions
- **Content-Only Updates**: Only `<main>` content is replaced, preserving header state
- **Theme-Matched Transitions**: All transition overlays match the current theme background
- **Unified Theme System**: Single system handles loader, overlay, and page backgrounds
- **Zero Flash Solution**: Fixed the actual problem instead of working around it
- **Files**: `unifiedTheme.js` and improved `seamlessNavigation.js`

## Major Structural Problems

### 1. **Duplicate Directory Structure**
```
/projects/          ← REMOVE ENTIRELY
  ├── forcedswitch.html
  ├── blacktempest.html
  └── ...
/works/             ← KEEP & STANDARDIZE
  ├── borabora.html    (✅ perfect structure)
  ├── forcedswitch.html (needs migration)
  └── ...
```

### 2. **Broken Navigation System**
- `works.html` is placeholder ("still under construction")
- Mixed references: `work.html` vs `works.html`, `home.html` vs `index.html`
- Some legacy pages reference non-existent paths

### 3. **CSS Framework Inconsistency**
- **Modern pages:** Use `stijl.css` with proper CSS variables and responsive design
- **Legacy pages:** Use `styles.css` with basic styling and hamburger menus

### 4. **File Organization Issues**
- Missing work pages that `exhibitions.html` links to:
  - `waitingcurrent.html`
  - `tunnelvision.html`
- Broken image references with case sensitivity issues
- Mixed file extensions (`.JPG` vs `.jpg`)

## Optimized Structure (2025-01-22)

### **Borabora.html - Reference Template Structure**
The `/works/borabora.html` file has been optimized and now serves as the ideal template:

```html
<!DOCTYPE html>
<html lang="en">
<head><!-- Clean meta tags, no extra spacing --></head>
<body>
    <div id="loader"></div>
    <header class="header" id="header"><!-- Standard navigation --></header>
    
    <main class="main">
        <!-- Hero Section -->
        <section class="hoofd-container video-section first-video">
            <h1>Work Title</h1> <!-- Proper h1 hierarchy -->
            <!-- Title video with metadata -->
        </section>
        
        <!-- Media Gallery -->
        <section class="media-gallery">
            <div class="media-item">
                <!-- Standardized media + credits pattern -->
                <div class="hoofd-container [video-section]">...</div>
                <div class="media-credits">...</div>
            </div>
            <!-- Repeated for each media item -->
        </section>
        
        <!-- Work Information -->
        <section class="work-information" id="work-description">
            <h2>Description</h2>
            <h2>Details</h2>
            <h2>Events</h2>
        </section>
    </main>
    
    <footer><!-- Standard footer --></footer>
    <script><!-- Standard script loading order --></script>
</body>
</html>
```

**Key Improvements:**
- Proper semantic HTML structure with h1/h2 hierarchy
- Consistent `.media-item` pattern for all videos/images
- Media credits grouped with their related content
- External JavaScript files (no inline scripts)
- CSS classes instead of inline styles
- Improved accessibility with proper alt text

## Technical Specifications

### **Required Meta Tags Template**
```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0i..."> <!-- Z logo -->
```

### **Standard Script Loading Order**
```html
<script src="../js/main.js"></script>
<script src="../js/navigation.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="../js/desktopMenu.js"></script>
<script src="../js/fogMenu.js"></script>
<script src="../js/workInteractions.js"></script> <!-- For work-specific functionality -->
<script src="../js/lastUpdated.js"></script>
<!-- Analytics -->
<script data-collect-dnt="true" async src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
<script defer src="https://cdn.overtracking.com/t/txfmtIDuX4qQyBwhC/"></script>
```

### **Navigation Structure**
```html
<header class="header" id="header">
    <a href="../index.html">Zhao Zhou</a>
    <nav class="menu">
        <span><a href="../about.html" data-letter="A"><span>About</span></a></span>
        <span><a href="../exhibitions.html" data-letter="E"><span>Exhibitions</span></a></span>
        <span><a href="../works.html" data-letter="W"><span>Works</span></a></span>
        <span><a href="../contact.html" data-letter="C"><span>Contact</span></a></span>
    </nav>
</header>
```

## Priority Action Items

### **Phase 1: Structure Cleanup**
1. Remove `/projects/` directory entirely
2. Create proper `works.html` index page listing all works
3. Fix broken internal navigation links
4. Ensure all linked works exist in `/works/` directory

### **Phase 2: Template Migration** 
1. Migrate all `/works/*.html` pages to use `borabora.html` structure
2. Remove all references to `styles.css`
3. Standardize script loading across all pages
4. Add missing DOCTYPE declarations and meta tags

### **Phase 3: Content Completion**
1. Create missing work pages referenced in `exhibitions.html`
2. Fix image file case sensitivity issues
3. Improve accessibility with proper alt text
4. Ensure consistent favicon implementation

## Development Guidelines

### **When Creating New Work Pages:**
1. Copy structure from `/works/borabora.html`
2. Update title, content, and asset paths
3. Maintain consistent CSS class usage
4. Follow standard script loading order
5. Include proper meta tags and favicon

### **When Making Structural Changes:**
- ✅ Template consistency improvements
- ✅ Navigation and link fixes  
- ✅ Meta tag and script loading standardization
- ✅ File organization and cleanup
- ❌ **NO** visual styling changes to working pages
- ❌ **NO** modifications to `stijl.css`

### **File Naming Conventions**
- Work pages: `/works/[projectname].html` (lowercase, no spaces)
- Assets: Consistent case sensitivity (prefer lowercase)
- Images: Use `.jpg` extension consistently

## Assets & Dependencies

### **External Dependencies**
- Adobe Typekit: `https://use.typekit.net/jnl8xmf.css`
- Three.js: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
- Vimeo Player API: `https://player.vimeo.com/api/player.js`
- Analytics: Simple Analytics + Overtracking

### **Key Assets Directory**
- Videos: `BoraBora_Clip*.mp4`
- Images: Various photographers (Riccardo De Vecchi, Ira Grünberger, etc.)
- Documents: `curriculumvitae_zhaozhou.pdf`

## Notes for Future Development

1. **Preserve Existing Functionality:** The modern pages (borabora, about, exhibitions, contact, index) work well and should not be visually modified
2. **Focus on Efficiency:** Structural improvements should reduce code duplication and improve maintainability
3. **Consistency First:** Ensure all pages follow the same technical structure
4. **Accessibility:** Maintain and improve semantic HTML structure
5. **Performance:** Keep script loading order optimized for page performance

---
*Last Updated: 2025-01-22*
*Template Reference: /works/borabora.html*