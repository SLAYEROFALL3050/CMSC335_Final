// ======================================== SETUP
const express = require("express");
const router = express.Router();

const projectsData = require('../public/Data/projects.json');


// ======================================== ROUTING

router.get ("/", (request, response) => {
    var portNum = request.portNum;

    const vars = {
        projects: addProjects(portNum.port)
    };

    response.render("projects", vars);
});

router.get ("/:project_id", (request, response) => {
    let project = projectsData.projects.find((item) => {
        return item.id == request.params.project_id;
    });

    const vars = {
        projectTitle: `${project.name}`,
        projectImage: `${project.imgLink}`,
        projectAlt: `picture of ${project.name}`,
        projectDesc: `${project.desc}`
    };
    
    response.render("project", vars);
});

router.use((request, response) => {
    response.status(404).send("Resource Not Found (in projects router)");
});


module.exports = router;

// FUNCTIONS
function addProjects (portNum) {
    list = "";

    projectsData.projects.forEach((project) => {
        list += '<div class="proctCard">\n<div class="cardContent">\n<div class="cardFront">\n';
        list += `<a class="cardLink" href="/projects/${project.id}">\n`;
        list += `<h3 class="cardTitle">${project.name}</h3>\n`;
        list += `<img class="cardImage" src="${project.imgLink}" alt="image of ${project.name}">\n`;
        list += `</a>\n</div>\n<div class="cardBack">\n`;
        list += `<img class="cardBackImage" src="/images/projects.svg" alt="projects back Design">\n`;
        list += `</div>\n</div>\n</div>\n`;
    });

    return list;
}