#!/bin/sh

# Function to generate a random string of given length
generate_random_string() {
    length=$1
    cat /dev/urandom | tr -dc 'a-z0-9' | fold -w $length | head -n 1
}

# Loop to run the MQTT publisher script 10 times
for i in {1..10}
do
    # Generate a random hub_id (e.g., 8 characters long)
    hub_id=$(generate_random_string 8)
    
    # Generate a random sleep duration between 1 and 10 seconds
    sleep_duration=$((RANDOM % 10 + 1))
    
    # Run the MQTT publisher Python script with the generated hub_id and sleep_duration
    python hub_simulator.py "$hub_id" "$sleep_duration" &
done

# Wait for all background jobs to finish
wait

echo "All 10 MQTT publisher instances have finished."
