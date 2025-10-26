document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault(); // prevent actual form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Simple front-end check
    if (email === "test@example.com" && password === "123456") {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('main-ui').style.display = 'block';
    } else {
        alert("Invalid email or password.");
    }
});
