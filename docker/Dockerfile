# Use the official Deno image
FROM denoland/deno:2.0.0

# Set the working directory
WORKDIR /usr/src/portal

# Copy the necessary files to the container
COPY . .

# Cache and install dependencies
RUN deno cache src/app.ts

# Run the application with necessary permissions
CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-write", "--allow-ffi", "--allow-run", "--allow-sys", "src/app.ts"]
