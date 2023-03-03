<h1>Eyewear Fit Finder</h1>
<p>Eyewear Fit Finder is a web application that uses facial scanning technology to measure and determine the perfect fit for eyewear. It accurately calculates key dimensions such as face width, pupil distance, nose pillar width, and degree, providing a personalized and seamless eyewear shopping experience.</p>
<p>This application is built using React and Flask, and it can be easily integrated with a Shopify website. The React app captures the user's facial image using a webcam and sends it to the Flask server for processing. The server then uses the Mediapipe library to extract the relevant facial landmarks and calculate the required measurements.</p>
<h2>Installation</h2>
<p>To install and run this application on your local machine, follow these steps:</p>
<ol>
  <li>Clone this repository to your local machine.</li>
  <li>Navigate to the eyewearscan directory and install the required dependencies by running:</li>
</ol>
<pre><code>npm install</code></pre>
<p>This will install all the required Node packages.</p>
<ol start="3">
  <li>Navigate to the server directory and create a virtual environment by running:</li>
</ol>
<pre><code>python -m venv env</code></pre>
<ol start="4">
  <li>Activate the virtual environment by running:</li>
</ol>
<pre><code>source env/bin/activate</code></pre>
<p>on Linux or macOS, or:</p>
<pre><code>env\Scripts\activate</code></pre>
<p>on Windows.</p>
<ol start="5">
  <li>Install the required Python packages by running:</li>
</ol>
<pre><code>pip install -r requirements.txt</code></pre>
<p>This will install all the required Python packages.</p>
<ol start="6">
  <li>Start the Flask server by running:</li>
</ol>
<pre><code>flask run</code></pre>
<p>This will start the server at <a href="http://localhost:5000">http://localhost:5000</a>.</p>
<ol start="7">
  <li>Start the React app by running:</li>
</ol>
<pre><code>npm start</code></pre>
<p>This will start the app at <a href="http://localhost:3000">http://localhost:3000</a>.</p>
<h2>Usage</h2>
<p>To use this application, follow these steps:</p>
<ol>
  <li>Open your web browser and navigate to <a href="http://localhost:3000">http://localhost:3000</a>.</li>
  <li>Allow the app to access your webcam.</li>
  <li>Place your face within the frame and click the "Scan" button.</li>
  <li>Wait for the app to scan your face and calculate the required measurements.</li>
  <li>View the measurements displayed on the screen.</li>
</ol>
