(function() {
    // 1. Inject the Custom CSS for the Popup and Blur Effect
    const style = document.createElement('style');
    style.innerHTML = `
        .global-error-overlay {
            position: fixed;
            top: 0; 
            left: 0; 
            width: 100vw; 
            height: 100vh;
            /* Semi-transparent dark background */
            background: rgba(0, 0, 0, 0.5);
            /* The magic property that blurs the website behind the overlay */
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2147483647; /* Maximum possible z-index to stay on top */
            font-family: system-ui, -apple-system, sans-serif;
            opacity: 0;
            animation: fadeIn 0.3s forwards;
        }
        
        .global-error-popup {
            background: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 90%;
            text-align: center;
            transform: translateY(20px);
            animation: slideUp 0.3s forwards;
        }

        .global-error-popup h2 {
            color: #d32f2f;
            margin-top: 0;
            font-size: 24px;
        }

        .global-error-popup p {
            color: #424242;
            font-size: 14px;
            word-wrap: break-word;
            background: #f5f5f5;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #d32f2f;
            text-align: left;
            font-family: monospace;
            max-height: 200px;
            overflow-y: auto;
        }

        .global-error-close {
            margin-top: 20px;
            padding: 10px 20px;
            background: #d32f2f;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s;
        }

        .global-error-close:hover {
            background: #b71c1c;
        }

        @keyframes fadeIn {
            to { opacity: 1; }
        }
        @keyframes slideUp {
            to { transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);

    // 2. Function to build and display the UI
    function triggerErrorPopup(errorMessage, source, lineno) {
        // Prevent multiple popups if multiple errors fire at once
        if (document.querySelector('.global-error-overlay')) return;

        // Create Overlay
        const overlay = document.createElement('div');
        overlay.className = 'global-error-overlay';

        // Create Popup Box
        const popup = document.createElement('div');
        popup.className = 'global-error-popup';

        // Create Title
        const title = document.createElement('h2');
        title.innerText = '⚠️ Application Error';

        // Create Error Details
        const details = document.createElement('p');
        const formattedSource = source ? `\n\nFile: ${source}\nLine: ${lineno}` : '';
        details.innerText = `${errorMessage}${formattedSource}`;

        // Create Close Button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'global-error-close';
        closeBtn.innerText = 'Dismiss';
        closeBtn.onclick = () => overlay.remove();

        // Assemble the DOM elements
        popup.appendChild(title);
        popup.appendChild(details);
        popup.appendChild(closeBtn);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    }

    // 3. Attach listeners to the Window object

    // Catches standard synchronous runtime errors
    window.onerror = function(message, source, lineno, colno, error) {
        triggerErrorPopup(message, source, lineno);
        return false; // Returns false so the error still logs normally in the dev console
    };

    // Catches asynchronous errors (failed Promises)
    window.addEventListener('unhandledrejection', function(event) {
        triggerErrorPopup(
            event.reason ? event.reason.toString() : 'Unhandled Promise Rejection', 
            'Async Operation', 
            'Unknown'
        );
    });

    // Catches resource loading errors (broken images, blocked scripts) during the capture phase
    window.addEventListener('error', function(event) {
        // Check if the error came from an HTML element (like <img>, <script>, or <link>)
        if (event.target && (event.target.src || event.target.href)) {
            triggerErrorPopup(
                `Resource failed to load: ${event.target.src || event.target.href}`, 
                event.target.tagName + ' Tag', 
                'N/A'
            );
        }
    }, true); // The 'true' sets it to capture phase, which is required for network errors

})();
