package main

// userUUIDByEmail returns the UUID of the user with the given email.
func userUUIDByEmail(email string) (string, error) {
	var uuid string
	err := DB.QueryRow(`SELECT uuid FROM users WHERE user_email = $1`, email).Scan(&uuid)
	return uuid, err
}
