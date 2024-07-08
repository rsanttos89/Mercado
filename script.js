document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("productForm");
    const productList = document.getElementById("list");
    const totalPriceElement = document.getElementById("totalPrice");
    const priceInput = document.getElementById("price");

    // Aplicar a máscara de moeda no campo de preço
    priceInput.addEventListener("input", (event) => {
        event.target.value = formatCurrency(event.target.value);
    });

    // Carregar produtos armazenados no localStorage ao carregar a página
    loadProducts();

    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Evitar o comportamento padrão de submissão do formulário

        // Coletar dados do formulário
        const description = document.getElementById("description").value.trim();
        const amount = parseInt(document.getElementById("amount").value.trim());
        const price = parseFloat(removeCurrencyMask(document.getElementById("price").value.trim()));

        if (description && !isNaN(amount) && !isNaN(price)) {
            // Criar objeto de produto
            const product = { description, amount, price };

            // Salvar produto no localStorage
            saveProduct(product);

            // Atualizar lista de produtos
            addProductToList(product);

            // Atualizar o total
            updateTotal();

            // Limpar o formulário
            form.reset();
        } else {
            alert("Por favor, preencha todos os campos corretamente.");
        }
    });

    function formatCurrency(value) {
        value = value.replace(/\D/g, "");
        value = (value / 100).toFixed(2) + "";
        value = value.replace(".", ",");
        value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        return "R$" + value;
    }

    function removeCurrencyMask(value) {
        return value.replace(/\D/g, "") / 100;
    }

    function loadProducts() {
        const products = JSON.parse(localStorage.getItem("products")) || [];
        products.forEach((product, index) => addProductToList(product, index));
        updateTotal();
    }

    function saveProduct(product) {
        const products = JSON.parse(localStorage.getItem("products")) || [];
        products.push(product);
        localStorage.setItem("products", JSON.stringify(products));
    }

    function addProductToList(product, index) {
        const productItem = document.createElement("div");
        productItem.className = "flex list-container";
        productItem.setAttribute('data-index', index);

        const descriptionSpan = document.createElement("span");
        descriptionSpan.textContent = product.description;

        const detailsDiv = document.createElement("div");
        detailsDiv.className = "flex row";

        const detailsSpan = document.createElement("span");
        detailsSpan.textContent = `${product.amount} x ${formatCurrency(product.price.toFixed(2))}`;

        const totalSpan = document.createElement("span");
        totalSpan.style.textAlign = "right";
        totalSpan.textContent = formatCurrency((product.amount * product.price).toFixed(2));

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remover";
        removeButton.className = "remove-button";
        removeButton.addEventListener("click", () => {
            removeProduct(index);
        });

        detailsDiv.appendChild(detailsSpan);
        detailsDiv.appendChild(totalSpan);

        productItem.appendChild(descriptionSpan);
        productItem.appendChild(detailsDiv);
        productItem.appendChild(removeButton);

        productList.appendChild(productItem);
    }

    function updateTotal() {
        const products = JSON.parse(localStorage.getItem("products")) || [];
        const total = products.reduce((sum, product) => sum + (product.amount * product.price), 0);
        totalPriceElement.textContent = formatCurrency(total.toFixed(2));
    }

    function removeProduct(index) {
        let products = JSON.parse(localStorage.getItem("products")) || [];
        products.splice(index, 1); // Remover o produto pelo índice

        // Atualizar o localStorage
        localStorage.setItem("products", JSON.stringify(products));

        // Atualizar a lista de produtos exibidos
        productList.innerHTML = ''; // Limpar a lista existente
        loadProducts(); // Recarregar os produtos atualizados

        // Atualizar o total
        updateTotal();
    }
});