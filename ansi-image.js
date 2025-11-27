class AnsiImageRenderer extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.imageElement = null
    this.canvas = null
    this.ctx = null
    this.resizeObserver = null
    this.fitDebounceTimer = null
    this.src = this.getAttribute('src') || ''
    this.alt = this.getAttribute('alt') || ''
    this.size = this.getAttribute('size') || 'standard'
    this.width = this.getAttribute('width') || ''
    this.colorMode = (this.getAttribute('color-mode') || 'full').toLowerCase()
    this.charset = (this.getAttribute('charset') || 'blocks').toLowerCase()
    this.fit = (this.getAttribute('fit') || 'auto').toLowerCase()
    this.fontFamily = this.getAttribute('font-family') || 'terminal-mono'
    this.styleElement = document.createElement('style')
    this.preElement = document.createElement('pre')
    this.scale = 1
    this.ansiOutput = ''
    this.preElement.style.setProperty('--ansi-scale', 1)
    this.shadowRoot.append(this.styleElement, this.preElement)
    this.applyStyles()
  }

  async connectedCallback() {
    if (this.src) {
      await this.loadAndConvertImage()
    }

    if (this.shouldAutoFit() && 'ResizeObserver' in window && !this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.debouncedFitImage())
      this.resizeObserver.observe(this)
    }
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    if (this.fitDebounceTimer) {
      clearTimeout(this.fitDebounceTimer)
      this.fitDebounceTimer = null
    }
  }

  debouncedFitImage() {
    if (this.fitDebounceTimer) {
      clearTimeout(this.fitDebounceTimer)
    }
    this.fitDebounceTimer = setTimeout(() => {
      this.fitImage()
      this.fitDebounceTimer = null
    }, 16)
  }

  static get observedAttributes() {
    return ['src', 'alt', 'size', 'width', 'color-mode', 'charset', 'fit', 'font-family']
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return
    }

    if (name === 'src') {
      this.src = newValue || ''
      if (this.src) {
        await this.loadAndConvertImage()
      } else {
        this.preElement.textContent = ''
      }
    } else if (name === 'alt') {
      this.alt = newValue || ''
      this.preElement.setAttribute('aria-label', this.alt)
    } else if (name === 'size') {
      this.size = newValue || 'standard'
      this.applyStyles()
      if (this.ansiOutput) {
        await this.loadAndConvertImage()
      }
    } else if (name === 'width') {
      this.width = newValue || ''
      if (this.ansiOutput) {
        await this.loadAndConvertImage()
      }
    } else if (name === 'color-mode') {
      this.colorMode = (newValue || 'full').toLowerCase()
      if (this.ansiOutput) {
        await this.loadAndConvertImage()
      }
    } else if (name === 'charset') {
      this.charset = (newValue || 'blocks').toLowerCase()
      if (this.ansiOutput) {
        await this.loadAndConvertImage()
      }
    } else if (name === 'font-family') {
      this.fontFamily = newValue || 'terminal-mono'
      this.applyStyles()
    } else if (name === 'fit') {
      this.fit = (newValue || 'auto').toLowerCase()
      this.toggleObserver()
      if (this.shouldAutoFit()) {
        this.fitImage()
      } else {
        this.scale = 1
        this.preElement.style.setProperty('--ansi-scale', 1)
      }
    }
  }

  normalize(value) {
    return (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
  }

  toggleObserver() {
    if (!('ResizeObserver' in window)) {
      return
    }

    if (this.shouldAutoFit()) {
      if (!this.resizeObserver) {
        this.resizeObserver = new ResizeObserver(() => this.debouncedFitImage())
      }
      this.resizeObserver.observe(this)
    } else if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
  }

  shouldAutoFit() {
    return this.fit !== 'none'
  }

  resolveSize(value) {
    const normalized = this.normalize(value)
    const sizes = {
      badge: 'clamp(0.5rem, 0.2vw + 0.4rem, 0.8rem)',
      mini: 'clamp(0.6rem, 0.25vw + 0.5rem, 1rem)',
      compact: 'clamp(0.7rem, 0.3vw + 0.6rem, 1.3rem)',
      standard: 'clamp(1.1rem, 0.45vw + 0.9rem, 2.2rem)',
      statement: 'clamp(1.7rem, 0.8vw + 1.4rem, 3.2rem)',
      heroic: 'clamp(2.3rem, 1.1vw + 1.9rem, 4.3rem)'
    }

    return sizes[normalized] || sizes.standard
  }

  resolveFontFamily(value) {
    const normalized = this.normalize(value)
    const fontStacks = {
      'terminal-mono': 'var(--font, "Inconsolata", "Fira Code", "Source Code Pro", monospace)',
      'system-mono': 'ui-monospace, "SFMono-Regular", "Menlo", "Consolas", "Liberation Mono", monospace',
      'retro-pixel': '"Courier New", "Lucida Console", "Monaco", monospace'
    }

    return fontStacks[normalized] || fontStacks['terminal-mono']
  }

  getCharacterSet() {
    const sets = {
      blocks: [' ', '░', '▒', '▓', '█'],
      dots: [' ', '·', '●', '◉', '●'],
      ascii: [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@', '$'],
      braille: [' ', '⠁', '⠂', '⠃', '⠄', '⠅', '⠆', '⠇', '⠈', '⠉', '⠊', '⠋', '⠌', '⠍', '⠎', '⠏', '⠐', '⠑', '⠒', '⠓', '⠔', '⠕', '⠖', '⠗', '⠘', '⠙', '⠚', '⠛', '⠜', '⠝', '⠞', '⠟', '⠠', '⠡', '⠢', '⠣', '⠤', '⠥', '⠦', '⠧', '⠨', '⠩', '⠪', '⠫', '⠬', '⠭', '⠮', '⠯', '⠰', '⠱', '⠲', '⠳', '⠴', '⠵', '⠶', '⠷', '⠸', '⠹', '⠺', '⠻', '⠼', '⠽', '⠾', '⠿']
    }
    return sets[this.charset] || sets.blocks
  }

  applyStyles() {
    if (!this.styleElement) {
      return
    }

    const sizeValue = this.resolveSize(this.size)
    const fontStack = this.resolveFontFamily(this.fontFamily)

    this.styleElement.textContent = `
      :host {
        display: block;
        width: 100%;
        max-width: 100%;
        overflow: hidden;
        text-align: left;
      }

      pre {
        display: block;
        width: fit-content;
        margin: 0;
        margin-inline-start: 0;
        margin-inline-end: auto;
        font-size: calc(${sizeValue} * var(--ansi-scale, 1));
        font-family: ${fontStack};
        line-height: 1;
        color: currentColor;
        white-space: pre;
        text-align: left;
      }
    `
  }

  async loadAndConvertImage() {
    if (!this.src) {
      return
    }

    try {
      // Load image
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = this.src
      })

      // Convert to ANSI
      this.ansiOutput = await this.convertToAnsi(img)
      this.preElement.innerHTML = this.ansiOutput
      this.preElement.setAttribute('aria-label', this.alt || 'ANSI art image')
      
      if (this.shouldAutoFit()) {
        this.fitImage()
      }
    } catch (error) {
      console.error('Error loading or converting image:', error)
      this.preElement.innerHTML = ''
      this.preElement.textContent = this.alt || '[Image failed to load]'
    }
  }

  async convertToAnsi(img) {
    // Calculate output dimensions
    const charWidth = this.width ? parseInt(this.width, 10) : this.calculateCharWidth()
    const aspectRatio = img.height / img.width
    const charHeight = Math.floor(charWidth * aspectRatio * 0.5) // 0.5 because chars are taller than wide

    // Create canvas for processing
    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')
    }

    this.canvas.width = charWidth
    this.canvas.height = charHeight

    // Draw and scale image to canvas
    this.ctx.drawImage(img, 0, 0, charWidth, charHeight)
    const imageData = this.ctx.getImageData(0, 0, charWidth, charHeight)
    const pixels = imageData.data

    // Get character set
    const chars = this.getCharacterSet()
    const charCount = chars.length

    // Build HTML output with CSS colors (browser-compatible)
    let output = ''
    let currentColor = null
    let colorSpan = ''

    for (let y = 0; y < charHeight; y++) {
      for (let x = 0; x < charWidth; x++) {
        const idx = (y * charWidth + x) * 4
        let r = pixels[idx]
        let g = pixels[idx + 1]
        let b = pixels[idx + 2]
        const a = pixels[idx + 3] / 255

        // Apply color mode
        if (this.colorMode === 'grayscale') {
          const gray = Math.floor(0.299 * r + 0.587 * g + 0.114 * b)
          r = g = b = gray
        } else if (this.colorMode === 'monochrome') {
          const gray = Math.floor(0.299 * r + 0.587 * g + 0.114 * b)
          r = g = b = gray > 127 ? 255 : 0
        }

        // Calculate brightness for character selection
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        const charIndex = Math.floor(brightness * (charCount - 1))
        const char = chars[charIndex]

        // Get color for this pixel
        const color = this.colorMode === 'monochrome' 
          ? (r > 127 ? '#ffffff' : '#000000')
          : `rgb(${r},${g},${b})`

        // Close previous span if color changed
        if (currentColor !== null && currentColor !== color) {
          output += '</span>'
          colorSpan = ''
        }

        // Open new span if color changed
        if (currentColor !== color) {
          output += `<span style="color: ${color}">`
          currentColor = color
        }

        // Escape HTML special characters
        const safeChar = char
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        
        output += safeChar
      }
      
      // Close span at end of line
      if (currentColor !== null) {
        output += '</span>'
        currentColor = null
      }
      output += '\n'
    }

    return output
  }

  calculateCharWidth() {
    // Calculate character width based on size preset
    const sizeMap = {
      badge: 40,
      mini: 50,
      compact: 60,
      standard: 80,
      statement: 100,
      heroic: 120
    }
    const normalized = this.normalize(this.size)
    return sizeMap[normalized] || sizeMap.standard
  }

  fitImage() {
    if (!this.preElement || !this.shouldAutoFit()) {
      return
    }

    // Reset to scale 1 before measuring
    this.preElement.style.setProperty('--ansi-scale', 1)
    
    // Force reflow to get accurate measurements at scale 1
    void this.preElement.offsetWidth

    const naturalWidth = this.preElement.scrollWidth
    const naturalHeight = this.preElement.scrollHeight

    if (!naturalWidth || !naturalHeight) {
      return
    }

    // Get available width from host element
    const hostRect = this.getBoundingClientRect()
    const availableWidth = hostRect.width - 2

    // For height, check parent's computed height
    const parentRect = this.parentElement?.getBoundingClientRect()
    const availableHeight = parentRect?.height || 0

    // Determine which axes to constrain
    const fitMode = this.fit
    const constrainWidth = fitMode === 'auto' || fitMode === 'both' || fitMode === 'width'
    const constrainHeight = fitMode === 'both' || fitMode === 'height'

    let nextScale = 1

    if (constrainWidth && availableWidth > 0) {
      const widthScale = availableWidth / naturalWidth
      nextScale = Math.min(nextScale, widthScale)
    }

    if (constrainHeight && availableHeight > 0) {
      const heightScale = availableHeight / naturalHeight
      nextScale = Math.min(nextScale, heightScale)
    }

    // Clamp scale to valid range
    nextScale = Math.max(0.01, Math.min(1, nextScale))

    if (!Number.isFinite(nextScale)) {
      nextScale = 1
    }

    this.scale = nextScale
    this.preElement.style.setProperty('--ansi-scale', nextScale)
  }
}

customElements.define('ansi-image', AnsiImageRenderer)

