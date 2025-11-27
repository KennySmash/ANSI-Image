# ANSI Image Component

A custom web component that converts images into colored ASCII art (ANSI art) using the Canvas API. Perfect for creating retro terminal-style image displays.

<img width="469" height="372" alt="image" src="https://github.com/user-attachments/assets/2775c372-1e33-4935-b5a0-57a07337bc97" />


## Overview

The `ansi-image` component takes an image source and converts it to colored ASCII art using character-based rendering. It supports multiple color modes, character sets, and automatic scaling to fit containers.

## Installation

Include the component script in your HTML:

```html
<script type="text/javascript" src="path/to/ansi-image.js"></script>
```

The component will automatically register itself as `<ansi-image>`.

## Usage

### Basic Example

```html
<ansi-image
    src="/images/photo.jpg"
    alt="Description of image"
    size="standard">
</ansi-image>
```

### With All Options

```html
<ansi-image
    src="/images/artwork.png"
    alt="Artwork description"
    size="compact"
    width="80"
    color-mode="full"
    charset="blocks"
    fit="auto"
    font-family="terminal-mono">
</ansi-image>
```

## Attributes

### Required Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `src` | string | URL path to the image file (supports any image format) |
| `alt` | string | Alternative text for accessibility (required for accessibility) |

### Optional Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `size` | string | `"standard"` | Size preset (see Size Presets below) |
| `width` | number | - | Character width of output (overrides size if specified) |
| `color-mode` | string | `"full"` | Color rendering mode (see Color Modes below) |
| `charset` | string | `"blocks"` | Character set for rendering (see Character Sets below) |
| `fit` | string | `"auto"` | Auto-fit mode (see Fit Modes below) |
| `font-family` | string | `"terminal-mono"` | Font family for rendering (see Font Families below) |

## Size Presets

The `size` attribute accepts the following presets with responsive font sizing:

- `badge` - Small badge size: `clamp(0.5rem, 0.2vw + 0.4rem, 0.8rem)`
- `mini` - Mini size: `clamp(0.6rem, 0.25vw + 0.5rem, 1rem)`
- `compact` - Compact size: `clamp(0.7rem, 0.3vw + 0.6rem, 1.3rem)`
- `standard` - Standard size: `clamp(1.1rem, 0.45vw + 0.9rem, 2.2rem)` (default)
- `statement` - Large statement: `clamp(1.7rem, 0.8vw + 1.4rem, 3.2rem)`
- `heroic` - Extra large: `clamp(2.3rem, 1.1vw + 1.9rem, 4.3rem)`

### Character Width

The `width` attribute allows you to specify the exact character width of the output, overriding the size preset:

```html
<ansi-image
    src="/image.jpg"
    width="100"
    alt="Wide image">
</ansi-image>
```

Default widths by size preset:
- `badge`: 40 characters
- `mini`: 50 characters
- `compact`: 60 characters
- `standard`: 80 characters
- `statement`: 100 characters
- `heroic`: 120 characters

## Color Modes

The `color-mode` attribute controls how colors are rendered:

- `full` - Full color rendering using RGB values (default)
- `grayscale` - Convert image to grayscale before rendering
- `monochrome` - Black and white only (high contrast)

### Example

```html
<!-- Full color -->
<ansi-image src="/image.jpg" color-mode="full" alt="Color image"></ansi-image>

<!-- Grayscale -->
<ansi-image src="/image.jpg" color-mode="grayscale" alt="Grayscale image"></ansi-image>

<!-- Monochrome -->
<ansi-image src="/image.jpg" color-mode="monochrome" alt="B&W image"></ansi-image>
```

## Character Sets

The `charset` attribute determines which characters are used to represent different brightness levels:

- `blocks` - Unicode block characters: ` ░▒▓█` (default, smooth gradients)
- `dots` - Dot patterns: ` ··●◉●`
- `ascii` - ASCII characters: ` .:-=+*#%@$`
- `braille` - Unicode braille patterns (detailed, requires Unicode support)

### Example

```html
<!-- Blocks (smooth) -->
<ansi-image src="/image.jpg" charset="blocks" alt="Block art"></ansi-image>

<!-- ASCII (classic) -->
<ansi-image src="/image.jpg" charset="ascii" alt="ASCII art"></ansi-image>

<!-- Braille (detailed) -->
<ansi-image src="/image.jpg" charset="braille" alt="Braille art"></ansi-image>
```

## Fit Modes

The `fit` attribute controls automatic scaling behavior:

- `auto` - Auto-fit by width only (default)
- `both` - Constrain by both width and height
- `width` - Constrain by width only
- `height` - Constrain by height only
- `none` - No auto-fitting, use natural size

When auto-fit is enabled, the component uses `ResizeObserver` to automatically scale the output to fit its container while maintaining aspect ratio.

## Font Families

The `font-family` attribute controls the monospace font stack used for rendering:

- `terminal-mono` - Terminal-style fonts: Inconsolata, Fira Code, Source Code Pro, monospace (default)
- `system-mono` - System monospace: SFMono-Regular, Menlo, Consolas, Liberation Mono, monospace
- `retro-pixel` - Retro pixel fonts: Courier New, Lucida Console, Monaco, monospace

## Examples

### Basic Image Conversion

```html
<ansi-image
    src="/images/logo.png"
    alt="Company logo"
    size="standard">
</ansi-image>
```

### Custom Width and Character Set

```html
<ansi-image
    src="/images/portrait.jpg"
    alt="Portrait"
    width="60"
    charset="ascii"
    color-mode="grayscale">
</ansi-image>
```

### Sidebar Display

```html
<aside class="sidebar">
    <ansi-image
        src="/images/badge.jpg"
        alt="Badge"
        size="compact"
        fit="auto"
        font-family="terminal-mono">
    </ansi-image>
</aside>
```

### Full Featured Example

```html
<ansi-image
    src="/images/artwork.png"
    alt="Digital artwork converted to ASCII"
    size="statement"
    width="120"
    color-mode="full"
    charset="blocks"
    fit="both"
    font-family="terminal-mono">
</ansi-image>
```

## Dynamic Updates

The component supports dynamic attribute updates. Changing any attribute will automatically re-convert and re-render the image:

```javascript
const ansiImage = document.querySelector('ansi-image');
ansiImage.setAttribute('src', '/new-image.jpg');
ansiImage.setAttribute('color-mode', 'grayscale');
ansiImage.setAttribute('charset', 'ascii');
```

## Image Loading

The component handles image loading asynchronously:

- Supports CORS-enabled images (uses `crossOrigin="anonymous"`)
- Handles loading errors gracefully
- Shows alt text or error message if image fails to load

### CORS Considerations

For images from different domains, ensure CORS headers are properly configured:

```html
<!-- Works with same-origin images -->
<ansi-image src="/local-image.jpg" alt="Local image"></ansi-image>

<!-- Requires CORS headers for cross-origin -->
<ansi-image src="https://example.com/image.jpg" alt="External image"></ansi-image>
```

## Browser Support

- Modern browsers with Web Components support
- Shadow DOM API
- Canvas API
- ResizeObserver API (for auto-fit feature)
- Image loading and CORS support

## Performance

- Image conversion happens asynchronously
- Resize operations are debounced (16ms) for smooth performance
- Canvas operations are optimized for performance
- Large images are automatically downscaled during conversion

### Performance Tips

- Use appropriate `width` values (smaller = faster)
- Consider `grayscale` or `monochrome` modes for faster rendering
- Use `fit="none"` if you don't need auto-scaling

## Accessibility

Always include a descriptive `alt` attribute:

```html
<ansi-image
    src="/images/chart.png"
    alt="Sales chart showing 25% increase in Q4">
</ansi-image>
```

The component automatically sets `aria-label` from the `alt` attribute for screen readers.

## Styling

The component uses Shadow DOM, so external CSS won't affect it directly. The component is styled to:

- Display as a block element
- Fill container width (100%)
- Left-align text by default
- Support responsive font sizing via size presets

## Technical Details

### Conversion Process

1. Image is loaded and drawn to a canvas
2. Canvas is sampled at the specified character width
3. Each pixel's RGB values are analyzed
4. Brightness is calculated for character selection
5. Colors are applied via CSS (browser-compatible, not ANSI escape codes)
6. Output is rendered as HTML with inline color styles

### Color Rendering

Unlike traditional ANSI art that uses escape codes, this component renders colors using CSS for browser compatibility:

- Colors are applied via `<span style="color: rgb(r,g,b)">` elements
- Each character can have its own color
- Optimized to minimize HTML by grouping same-colored characters

## Limitations

- Large images may take time to convert
- Very high character widths (>200) may impact performance
- Braille character set requires Unicode support
- CORS restrictions apply to cross-origin images

## License

This component is part of the theme and follows the theme's license.

## Credits

- Built with Web Components API
- Uses Canvas API for image processing
- Inspired by traditional ANSI art and ASCII art techniques

