// // Select all elements with the class 'hidden'
// const boxes = document.querySelectorAll('.section');

// const handleScroll = () => {
//   boxes.forEach((box) => {
//     // Get the element's position relative to the viewport
//     const rect = box.getBoundingClientRect();
//     const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

//     if (isVisible) {
//       box.classList.add('visible');
//       box.classList.remove('hidden');
//     }
//   });
// };

// // Attach the scroll event listener
// window.addEventListener('scroll', handleScroll);

const menu = document.querySelector('.menu')
const mobNav = document.querySelector('.mobile')
const navs = document.querySelectorAll('.nav')

menu.addEventListener('click', (e) =>{
    menu.classList.toggle('active')
    mobNav.classList.toggle('show')
})

navs.forEach((nav) => {
    nav.addEventListener('click', (e) => {
        // if (menu.classList.contains('active')) {
            menu.classList.remove('active')
            mobNav.classList.remove('show')
            menu.innerHTML = '<i class="fa-solid fa-bars"></i>';
        // } 
    })
});


