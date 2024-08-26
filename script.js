// // scripts.js
// document.addEventListener('DOMContentLoaded', () => { //make sure the document object model has finished loading
//     const registerForm = document.getElementById('register-form');
//     const loginForm = document.getElementById('login-form');

//     registerForm.addEventListener('submit', async (event) => {
//         event.preventDefault();//prevent reloading the page
//         const formData = new FormData(registerForm);//enables to fetch the form data
//         const username = formData.get('username');
//         const password = formData.get('password');
//         const email = formData.get('email');
//         const full_name = formData.get('full_name');
//         //method to handle errors
//         try {
//             const response = await fetch('/plp/users/registration', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ username, password, email, full_name })
//             });
//             if (response.ok) {
//                 alert('Registration successful');
//             } else {
//                 alert('Registration failed');
//             }
//         } catch (error) {
//             console.error('Error occurred:', error);
//         }
//     });

//     loginForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const formData = new FormData(loginForm);
//         const username = formData.get('username');
//         const password = formData.get('password');
//         try {
//             const response = await fetch('/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ username, password })
//             });
//             if (response.ok) {
//                 alert('Login successful');
//             } else {
//                 alert('Invalid username or password');
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     });
// });


// script.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    // Check if registerForm exists before adding event listener
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(registerForm);
            const username = formData.get('username');
            const password = formData.get('password');
            const email = formData.get('email');
            const full_name = formData.get('full_name');

            try {
                const response = await fetch('/plp/users/registration', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password, email, full_name })
                });
                if (response.ok) {
                    alert('Registration successful');
                } else {
                    alert('Registration failed');
                }
            } catch (error) {
                console.error('Error occurred:', error);
            }
        });
    }

    // Check if loginForm exists before adding event listener
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(loginForm);
            const username = formData.get('username');
            const password = formData.get('password');

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                if (response.ok) {
                    alert('Login successful');
                } else {
                    alert('Invalid username or password');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }
});
