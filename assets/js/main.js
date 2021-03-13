const cartCounterLabel = document.querySelector('#cart-counter');
const buttonsContainer = document.querySelector('#content-container');


let cartCounter = 0;
let cartPrice = 0;

function clickHandler(e) {
  let target = e.target;

  if (target.classList.contains('item-actions__cart')) {
    cartCounterLabel.innerHTML = `${++cartCounter}`;
    if(cartCounter === 1) cartCounterLabel.style.display = 'block';
    const mockData = +target
    .parentElement
    .previousElementSibling
    .innerHTML
    .replace(/^\$(\d+)\s\D+(\d+).*$/, '$1.$2');

    cartPrice = Math.round((cartPrice + mockData) * 100) / 100;

    let restoreHTML = target.innerHTML;

    target.innerHTML = `Added ${cartPrice.toFixed(2)} $`;
    target.disabled = true;
    buttonsContainer.removeEventListener('click', clickHandler);
    
    setTimeout(() => {
      target.innerHTML = restoreHTML;
      target.disabled = false;
      buttonsContainer.addEventListener('click', clickHandler);
    }, 2000)
  }
}

buttonsContainer.addEventListener('click', clickHandler);