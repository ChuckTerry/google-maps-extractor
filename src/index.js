/**
 * GoogleMapsExtractor class is used to extract and stitch together map images from Google Maps.
 * 
 * @class GoogleMapsExtractor
 */
class GoogleMapsExtractor {

    /**
     * Creates an instance of GoogleMapsExtractor.
     * 
     * @constructor
     * @param {number} x - The x-coordinate for the map.
     * @param {number} y - The y-coordinate for the map.
     * @param {number} [zoom=21] - The zoom level for the map.
     * @param {number} [width=8] - The width of the map. Maximum allowed value is 64.
     * @param {boolean} [autoStart=false] - Whether to start the extraction process automatically.
     */
    constructor(x, y, zoom = 21, width = 8, autoStart = false) {
      this.x = x;
      this.y = y;
      this.zoom = zoom;
      if (width > 64) {
        console.error('GoogleMapsExtractor: Width parameter over 64 will cause canvas failure. Width updated to 64.');
        width = 64;
      }
      this.width = width;
      this.chunksLoaded = 0;
      this.done = false;
      this.canvas = document.createElement('canvas');
      document.body.append(this.canvas);
      if (autoStart === true) {
        this.start();
      }
    }
    
    /**
     * Downloads all images in a grid defined by the instance's width, x, and y properties.
     * 
     * @returns {Promise<Array<Array<Object>>>} A promise that resolves to a 2D array (matrix) of images.
     */
    async downloadAllImages() {
      const matrix = [];
      for (let yIndex = 0; yIndex < this.width; yIndex++) {
        const rowArray = [];
        for (let xIndex = 0; xIndex < this.width; xIndex++) {
          const image = await this.getImage(this.x + xIndex, this.y + yIndex);
          rowArray.push(image);
          this.chunksLoaded++;
        }
        matrix.push(rowArray);
      }
      return matrix;
    }
    
    /**
     * Fetches an image from Google Maps based on the provided x, y coordinates and the current zoom level.
     * Converts the fetched image to a base64 encoded data URL and returns it as an Image object.
     *
     * @param {number} x - The x coordinate for the image.
     * @param {number} y - The y coordinate for the image.
     * @returns {Promise<HTMLImageElement>} A promise that resolves to an Image object containing the fetched image.
     */
    async getImage(x, y) {
      const params = `?x=${x}&y=${y}&z=${this.zoom}`;
      const url = `https://khms1.google.com/kh/v=988${params}`;
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      let binary = '';
      const bytes = [...new Uint8Array(buffer)];
      bytes.forEach((charCode) => binary += String.fromCharCode(charCode));
      const image = new Image();
      image.src = `data:image/jpeg;base64,${window.btoa(binary)}`;
      return image;
    }
    
    /**
     * Starts the image extraction process.
     * 
     * @param {boolean} [downloadWhenComplete=true] - Determines whether to download the images when the process is complete.
     * @returns {Promise<void>} - A promise that resolves when the process is complete.
     */
    async start(downloadWhenComplete = true) {
      console.clear();
      this.chunksLoaded = 0;
      this.startTime = Date.now();
      this.reportProgress();
      this.imageMatrix = await this.downloadAllImages();
      this.hidePageElements();
      this.buildCanvas(this.imageMatrix);
      this.reportProgress(true);
      this.done = true;
      this.logTime();
      document.body.style.overflow = 'visible';
      if (downloadWhenComplete) {
        this.download();
      }
    }
    
    /**
     * Builds a canvas from a matrix of images and draws the images onto the canvas.
     *
     * @param {HTMLImageElement[][]} imageMatrix - A 2D array of HTMLImageElement objects.
     */
    buildCanvas(imageMatrix) {
      const count = imageMatrix.length
      this.canvas.width = this.canvas.height = count * 256;
      const context = this.canvas.getContext('2d');
      for (let rowIndex = 0; rowIndex < count; rowIndex++) {
        const x = rowIndex * 256;
        for (let cellIndex = 0; cellIndex < count; cellIndex++) {
          const y = cellIndex * 256;
          const image = imageMatrix[cellIndex][rowIndex];
          context.drawImage(image, x, y);
        }
      }
    }
    
    /**
     * Downloads the current canvas content as an image file.
     */
    download() {
      this.canvas.toBlob((blob) => {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = 'extracted_map.png';
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      });
    }
    
    /**
     * Iterates through all child elements of the document body and sets
     * their display style to 'none', unless the element is the canvas.
     */
    hidePageElements() {
      const array = [...document.body.children];
      const elementCount = array.length;
      for (let index = 0; index < elementCount; index++) {
        const element = array[index];
        if (element !== this.canvas) {
          element.style.display = 'none';
        }
      }
    }
    
    /**
     * Logs the time elapsed since the start time in a human-readable format.
     */
    logTime() {
      let seconds = Math.ceil((Date.now() - this.startTime) / 1000);
      let logString = 'Operation completed in';
      const hours = Math.floor(seconds / 3600);
      if (hours > 0) {
        logString += ` ${hours} hours`;
        seconds = seconds - 3600 * hours;
      }
      const minutes = Math.floor(seconds / 60);
      if (minutes > 0) {
        logString += ` ${minutes} minutes`;
        seconds = seconds - 60 * minutes;
      }
      logString += ` ${seconds} seconds.`;
      console.log(logString);
    }
    
    /**
     * Reports the progress of chunks being downloaded.
     * 
     * @param {boolean} [finalReport=false] - Indicates if this is the final progress report.
     * @returns {void}
     */
    reportProgress(finalReport = false) {
      if (this.done) {
          return;
      }
      const chunks = this.width ** 2;
      if (finalReport) {
        console.log(`[100% Complete] ${chunks} chunks downloaded successfully.`);
        return;
      }
      const loaded = this.chunksLoaded
      const progress = loaded / chunks * 100;
      const percent = progress.toFixed(2);
      console.log(`[${percent}% Complete] ${loaded} out of ${chunks} chunks downloaded.`);
      if (loaded !== chunks) {
        window.setTimeout(() => {
          this.reportProgress();
        }, 10000);
      }
    }
  }
  
  const extractor = new GoogleMapsExtractor(571370, 828241, 21, 64, true);
  
