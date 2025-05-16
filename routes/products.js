// ======================================== SETUP
const express = require("express");
const router = express.Router();

const projectsData = require('../public/Data/projects.json');
const productsData = require('../public/Data/products.json');

// ======================================== ROUTING

router.get ("/", (request, response) => {
    var portNum = request.portNum;

    const vars = {
        products: addProducts(portNum.port)
    };

    response.render("products", vars);
});

router.get ("/:product_id", (request, response) => {
    let project = projectsData.projects.find((item) => {
        return item.id == request.params.product_id;
    });

    let { price } = productsData.products.find((item) => {
        return item.id == request.params.product_id;
    });

    const vars = {
        productTitle: `${project.name}`,
        productImage: `${project.imgLink}`,
        productAlt: `picture of ${project.name}`,
        productPrice: `$${price.toFixed(2)}`,
        productDesc: `${project.desc}`
    };
    
    response.render("product", vars);
});

router.use((request, response) => {
    response.status(404).send("Resource Not Found (in products router)");
});


module.exports = router;


// FUNCTIONS
function addProducts (portNum) {
    list = "";

    productsData.products.forEach((product) => {
        project = projectsData.projects.find((project) => {
            return project.id == product.id;
        });

        list += '<div class="proctCard">\n<div class="cardContent">\n<div class="cardFront">\n';
        list += `<a class="cardLink" href="/products/${product.id}">\n`;
        list += `<h3 class="cardTitle">${project.name}</h3>\n`;
        list += `<img class="cardImage" src="${project.imgLink}" alt="image of ${project.name}">\n`;
        list += `<p class="cardPrice">$${product.price.toFixed(2)}</p>\n`;
        list += `</a>\n</div>\n<div class="cardBack">\n`;
        list += `<img class="cardBackImage" src="/images/products.svg" alt="products back Design">\n`;
        list += `</div>\n</div>\n</div>\n`;
    });

    return list;
}

/*

<div class="proctCard">
    <div class="cardContent">
        <div class="cardFront">
            <a class="cardLink" href="http://localhost:${portNum}/products/${product.id}">
                <h3 class="cardTitle">${project.name}</h3>
                <img class="cardImage" src="${project.imgLink}" alt="image of ${project.name}">
                <p class="cardPrice">$${product.price.toFixed(2)}</p>
            </a>
        </div>
        <div class="cardBack">
            <img class="cardBackImage" src="/images/products.svg" alt="products back Design">
        </div>
    </div>
</div>

*/