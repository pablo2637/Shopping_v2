document.addEventListener('DOMContentLoaded', () => {

    //VARIABLES
    const body = document.querySelector('body');
    const divGridContCat = document.querySelector('.divGridContCat')
    const divGridContItem = document.querySelector('.divGridContItem');
    const secItems = document.querySelector('.secItems');
    const h2SecItems = document.querySelector('.secItems h2');
    const h2SecCat = document.querySelector('.secCategorias h2');
    const divCesta = document.querySelector('#divCesta');
    const tbody = document.querySelector('tbody');
    const tdFootPrecio = document.querySelector('tfoot td');
    const pStatus = document.querySelector('#pStatus span');
    const pReadyStatus = document.querySelector('#pReadyStatus span');
    const pError = document.querySelector('#pError')
    const divCompraFinalizada = document.querySelector('#divCompraFinalizada');
    const spnCantidad = document.querySelector('#spnCantidad');


    const objCategories = { url: 'https://dummyjson.com/products/categories', tipo: 'categories' };

    const objID = {
        url: 'https://dummyjson.com/products/',
        tipo: 'id',
        id: 0
    };

    const objCategory = {
        url: 'https://dummyjson.com/products/category/',
        tipo: 'category',
        categoria: ''
    };

    const arrayCesta = JSON.parse(localStorage.getItem("arrayCesta")) || [];

    let arrayCategorias;


    //EVENTOS ********************************************************************************
    window.addEventListener('resize', () => paintCategories());


    body.addEventListener('click', ({ target }) => {
        //Cart.html
        if (target.matches('i') && target.parentNode.id == 'btnSeguir')
            location.assign('index.html');

        else if (target.id == 'btnFinalizar') {

            if (tdFootPrecio.textContent != 'Total: 0€') {

                target.disabled = true;
                finishBuy()
                setTimeout(() => { location.assign('index.html') }, 5000);

            }
        }

        //Carrito
        if (target.classList.contains("cesta")) {

            if (target.matches('i') && target.parentNode.id == 'btnCesta')
                divCesta.classList.toggle('ocultar');


            if (target.classList.contains('add'))
                cartItemAddOne(target.parentNode.parentNode.id);

            else if (target.classList.contains('remove'))
                cartItemSubOne(target.parentNode.parentNode.id);

            else if (target.classList.contains('empty'))
                removeCartItem(target.parentNode.parentNode.id);

            else if (target.id == 'btnVaciarCesta' || target.parentNode.id == 'btnVaciarCesta')
                emptyCart();

            else if (target.id == 'btnComprar' || target.parentNode.id == 'btnComprar')
                location.assign('cart.html');

            else if (target.id == 'btnOcultar')
                divCesta.classList.toggle('ocultar');

        }

        //Card Items
        if (target.classList.contains('item')) {

            if (target.matches('button'))
                getID(target.parentNode.id);

        }

        //Card Categoria
        if (target.classList.contains('categoria')) {

            if (target.matches('i') && target.parentNode.id == 'btnRight') {

                const ultNro = document.querySelector('[nro]:last-of-type');
                paintCategories(null, ultNro.getAttribute('nro'));

            } else if (target.matches('i') && target.parentNode.id == 'btnLeft') {

                const primNro = document.querySelector('[nro]:first-of-type');
                paintCategories(primNro.getAttribute('nro'));

            } else if (target.matches('h3')) {

                removeSelectedClass(target.parentNode.parentNode);
                getItems(target.parentNode.parentNode.id);

            } else if (target.matches('div')) {

                removeSelectedClass(target);
                getItems(target.id);
            }
        }
    });


    //FUNCIONES ***************************************************************************

    // Secundarias
    const removeSelectedClass = async (target) => {

        const divSelected = document.querySelector('.catSelected');

        if (divSelected)
            await removeClass(divSelected);

        if (target)
            target.classList.toggle('catSelected');
    };


    const removeClass = async (divSelected) => divSelected.classList.toggle('catSelected')


    const showStatusChange = data => {

        pStatus.textContent = data.status + ' ' + data.statusText;
        pReadyStatus.innerText = data.ok

        msg(`URL: ${data.url}`);

    };


    const msg = mensaje => pError.textContent = mensaje;


    const firstLetterUC = string => {

        let letra = string.charAt(0);
        return string.replace(letra, letra.toUpperCase());

    };


    const finishBuy = () => {

        localStorage.removeItem('catSelected');
        emptyCart();

        divCompraFinalizada.style = 'display: inherit';

    };


    //Dependiendo el tamaño de la pantalla devuelva la cantiadad de botones a pintar.
    const getButtons = () => {

        let sw = window.innerWidth;

        if (sw < 430)
            return 1;
        if (sw >= 430 && sw < 640)
            return 2;
        if (sw >= 640 && sw < 768)
            return 3;
        if (sw >= 768 && sw < 992)
            return 4;
        if (sw >= 992 && sw < 1200)
            return 5;
        if (sw >= 1200)
            return 6;

    };


    //Devuelve desde y hasta qué categoría pintar.
    const getFromTo = (primNro, ultNro) => {

        let desde, hasta;
        let extraRight = 0;
        let extraLeft = 0;

        const tope = arrayCategorias.length - 1;
        let cantBtnCat = getButtons();

        cantBtnCat--;
        if (!primNro && !ultNro) {

            desde = 0;
            hasta = cantBtnCat;

        } else if (!primNro && ultNro) {

            ultNro = parseInt(ultNro);
            ultNro++;
            desde = ultNro - cantBtnCat;
            hasta = ultNro;

        } else if (primNro && !ultNro) {

            primNro = parseInt(primNro);
            primNro--;
            desde = primNro;
            hasta = primNro + cantBtnCat;

        }

        if (hasta > tope) {

            extraRight = hasta - tope;
            hasta = tope;

            if (desde >= hasta) {

                desde = 0;
                hasta = cantBtnCat;
                extraRight = 0;
            }

        } else if (desde < 0) {

            extraLeft = (tope + 1) + desde;
            desde = 0;

            if (hasta < 0) {
                extraLeft = 0;
                desde = tope - cantBtnCat;
                hasta = tope;
            }

        }

        return { desde, hasta, extraLeft, extraRight };
    };


    // Local Storage
    const getLocal = category => {

        if (category)
            return localStorage.getItem('catSelected') || '';

        else
            return JSON.parse(localStorage.getItem("arrayCesta")) || [];

    };


    const setLocal = category => {

        if (category)
            localStorage.setItem('catSelected', category);

        else
            localStorage.setItem("arrayCesta", JSON.stringify(arrayCesta));

    };


    // Principales *****************************************************************

    //Fetch
    const fetchData = async (data) => {

        try {
            let url;

            switch (data.tipo) {
                case 'categories':
                    url = data.url;
                    break;

                case 'category':
                    url = data.url + data.categoria;
                    break;

                case 'id':
                    url = data.url + data.id;
                    break;

            };

            const peticion = await fetch(url);
            showStatusChange(peticion)

            if (peticion.ok) {

                const resp = await peticion.json();
                return {
                    ok: true,
                    response: resp,
                };

            } else {

                throw {
                    ok: false,
                    response: `Error: status ${peticion.status}`

                };
            }

        } catch (error) {
            return error;

        };
    };


    // Carrito de la compra

    //Vacia el carrito completo
    const emptyCart = () => {

        arrayCesta.splice(0);
        tdFootPrecio.textContent = 'Total: 0€';

        setLocal();
        paintCart();

    };


    //Quita un item del carrito
    const removeCartItem = id => {

        const indItem = arrayCesta.findIndex(item => item.id == id.replace('tr', ''));

        arrayCesta.splice(indItem, 1);

        setLocal();
        paintCart();

    };


    //Resta 1 unidad del item
    const cartItemSubOne = id => {

        const indItem = arrayCesta.findIndex(item => item.id == id.replace('tr', ''));

        arrayCesta[indItem].cantidad -= 1;
        arrayCesta[indItem].subTotal = arrayCesta[indItem].cantidad * arrayCesta[indItem].price;

        if (arrayCesta[indItem].cantidad == 0) arrayCesta.splice(indItem, 1);

        setLocal();
        paintCart();

    };


    //Suma 1 unidad del item
    const cartItemAddOne = id => {

        const indItem = arrayCesta.findIndex(item => item.id == id.replace('tr', ''));

        arrayCesta[indItem].cantidad += 1;
        arrayCesta[indItem].subTotal = arrayCesta[indItem].cantidad * arrayCesta[indItem].price;

        setLocal();
        paintCart();

    };


    //Agregar el item al carrito
    const addToCart = async ({ id, title, price, thumbnail }) => {

        const objItem = arrayCesta.find(item => item.id == id);

        if (objItem) {

            const indItem = arrayCesta.findIndex(item => item.id == id)
            arrayCesta[indItem].cantidad += 1;
            arrayCesta[indItem].subTotal = arrayCesta[indItem].cantidad * arrayCesta[indItem].price;

        } else
            arrayCesta.push({ id, title, price, thumbnail, cantidad: 1, subTotal: price });

        setLocal();
        paintCart();

    };


    //Creación de Cards
    const createItemCard = item => {
        const divCardItem = document.createElement('DIV');
        divCardItem.classList.add('divCardItem');
        divCardItem.id = item.id;

        const imgItem = document.createElement('IMG');
        imgItem.src = item.images[0];
        imgItem.title = item.description;
        imgItem.alt = item.title;

        const h3Item = document.createElement('H3');
        h3Item.textContent = item.title;

        const pItem = document.createElement('P');
        pItem.classList.add('precio');
        pItem.innerHTML = `Precio: <span>${item.price}€</span>`;

        const divStars = document.createElement('DIV');
        divStars.classList.add('divStars');
        divStars.append(setStars(item.rating));

        const btnItem = document.createElement('BUTTON');
        btnItem.textContent = 'Añadir a la cesta';
        btnItem.classList.add('item');

        divCardItem.append(imgItem, h3Item, pItem, divStars, btnItem);
        return divCardItem;
    }

    //Pinta las estrellas
    const setStars = rating => {
        const fragment = document.createDocumentFragment();
        let nro = 5 - Math.round(rating);

        for (let i = 1; i <= 5; i++) {
            const imgStar = document.createElement('IMG');
            if (i <= 5 - nro) imgStar.src = 'assets/star1.png';
            else imgStar.src = 'assets/star2.png';
            imgStar.setAttribute('width', 15 + i);
            fragment.append(imgStar);
        }
        return fragment;
    }


    const createCategoyCard = (category, index) => {
        const divCardCat = document.createElement('DIV');
        divCardCat.classList.add('divCardCat', 'categoria');
        divCardCat.id = category;
        divCardCat.setAttribute('nro', index);

        const divH3 = document.createElement('DIV');
        divH3.classList.add('categoria');

        const h3Cat = document.createElement('H3');
        h3Cat.textContent = firstLetterUC(category);
        h3Cat.classList.add('categoria');

        divH3.append(h3Cat);
        divCardCat.append(divH3);

        return divCardCat;
    }


    //Pinta en el DOM
    const paintItems = items => {
        const fragment = document.createDocumentFragment();

        items.forEach(item => fragment.append(createItemCard(item)));
        divGridContItem.innerHTML = '';
        divGridContItem.append(fragment);
    }


    const paintCategories = (primNro, ultNro) => {
        const fragment = document.createDocumentFragment();
        const tope = arrayCategorias.length - 1;
        const { desde, hasta, extraRight, extraLeft } = getFromTo(primNro, ultNro);

        if (extraLeft > 0) {
            for (let i = tope; i >= extraLeft; i--) {
                fragment.prepend(createCategoyCard(arrayCategorias[i], i - (tope + 1)));
            }
        }

        for (let i = desde; i <= hasta; i++) {
            fragment.append(createCategoyCard(arrayCategorias[i], i));
        }

        if (extraRight > 0) {
            for (let i = 0; i < extraRight; i++) {
                fragment.append(createCategoyCard(arrayCategorias[i], i + tope + 1));
            }
        }

        const btnLeft = document.createElement('BUTTON');
        btnLeft.innerHTML = '<i class="fa-solid fa-circle-arrow-left categoria"></i>'
        btnLeft.id = 'btnLeft';
        fragment.prepend(btnLeft);

        const btnRight = document.createElement('BUTTON');
        btnRight.innerHTML = '<i class="fa-solid fa-circle-arrow-right categoria"></i>'
        btnRight.id = 'btnRight';
        fragment.append(btnRight);

        divGridContCat.innerHTML = '';
        divGridContCat.append(fragment);

        const ultCategoria = getLocal('cat');
        if (ultCategoria != '') {
            const divSelected = document.querySelector('#' + ultCategoria);
            if (divSelected) divSelected.classList.toggle('catSelected');
        }
    }

    const paintCart = () => {
        const fragment = document.createDocumentFragment();
        const newArray = getLocal();
        let total = 0;
        let totalItems = 0;

        newArray.forEach(item => {
            const trItem = document.createElement('TR');
            trItem.id = 'tr' + item.id;

            const tdImg = document.createElement('TD');
            tdImg.innerHTML = `<img src='${item.thumbnail}'>`;

            const tdDesc = document.createElement('TD');
            tdDesc.textContent = item.title;
            tdDesc.classList.add('producto');

            const tdPrecio = document.createElement('TD');
            tdPrecio.textContent = item.price + '€';


            const tdCant = document.createElement('TD');
            tdCant.innerHTML += `<button class='remove cesta'>-</button>${item.cantidad}<button class='add cesta'>+</button>`;
            tdCant.classList.add('cantidad');

            total += item.subTotal;
            totalItems += item.cantidad;

            const tdTotal = document.createElement('TD');
            tdTotal.textContent = item.subTotal + '€';

            const tdVaciar = document.createElement('TD');
            tdVaciar.innerHTML = `<button class='empty cesta'>X</button>`;

            trItem.append(tdImg, tdDesc, tdPrecio, tdCant, tdTotal, tdVaciar);
            fragment.append(trItem);
        })
        //Si no hay nada en el carrito
        if (newArray.length == 0) {
            const trCestaVacia = document.createElement('TR');
            const tdCestaVacia = document.createElement('TD');
            tdCestaVacia.textContent = 'No hay productos en la cesta.';
            tdCestaVacia.setAttribute('colspan', '6');

            trCestaVacia.append(tdCestaVacia)
            fragment.append(trCestaVacia);
        }
        if (spnCantidad) spnCantidad.textContent = totalItems;
        tdFootPrecio.textContent = `Total: ${total}€`

        tbody.innerHTML = '';
        tbody.append(fragment);
    }


    //Buscar la información a traves del fetch ======>>>>>>>>>>>>
    //Busca por ID un elemento
    const getID = async (id) => {
        objID.id = id;
        const { ok, response } = await fetchData(objID);

        if (ok) addToCart(response);
        else msg(`Error fetchID: ${response}`);
    }

    //Busca los items de una categoria
    const getItems = async (category) => {
        setLocal(category);
        secItems.classList.remove('ocultar');
        h2SecItems.textContent = category.toUpperCase();
        h2SecItems.id = category + '!';

        objCategory.categoria = category;
        const { ok, response } = await fetchData(objCategory);

        if (ok) paintItems(response.products);
        else msg(`Error fetchItems: ${response}`);
    }

    //Busca las categorias
    const getCategories = async () => {
        divCesta.classList.toggle('ocultar');
        const { ok, response } = await fetchData(objCategories);

        if (ok) {
            arrayCategorias = [].concat(response);
            h2SecCat.textContent = `Categorías: ${arrayCategorias.length}`;
            paintCategories();
        }
        else msg(`Error fetchCategorias: ${response}`);
    }


    //Función inicializadora
    const init = () => {
        const url = location.toString();
        console.log('url', url)
        if (url.includes('cart')) {
            console.log('cart')
            paintCart();
        } else if (url.includes('index') || url.includes('Shopping')) {
            console.log('index')
            secItems.classList.add('ocultar');
            paintCart();
            getCategories();
            const ultCategoria = getLocal('cat');
            if (ultCategoria) getItems(ultCategoria);
        }
        console.log('fuera')
    }

    init();

}) //Load