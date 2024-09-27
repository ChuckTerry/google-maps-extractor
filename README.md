# google-maps-extractor
Downloads Google Maps Tiles and stitches them together into a single image.

This is some code I use for building large images from Google Maps.  It's not really intended as a public release, just uploading it in case others find it useful.

If you do decide to use it, you'll need to get the x and y coordinates from the DevTools Networ Panel (Look for it in the fetch requests when dragging the map).  You'll also need to either use a local proxy to bypass CSP and CORS or, if you're lazy like me, copy/paste it into the Devtools Console.

Best not to drag the map around or leave the page until the image downloads.  Large width values will take a few minutes to complete.  Width is also capped at 64 as it's the largest value I've found that can be downloaded without causing the canvas to throw an overload error.  Some browsers will limit you even further on maximum width.  Note that a value of 64 will result in 4096 network requests and end up with a download size between 350MB and 400MB.

