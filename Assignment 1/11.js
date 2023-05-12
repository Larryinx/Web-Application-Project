function special() {
    const targetDiv = document.getElementById("extra-bar");
    if (targetDiv.style.display == "none") {
        targetDiv.style.display = "block";
    } else {
        targetDiv.style.display = "none";
    }
}

function align() {
    const targetDiv = document.getElementById("posi");
    const targetDiv2 = document.getElementById("posi2");
    if (targetDiv.className == "row text-start") {
        targetDiv.className = "row text-center";
        targetDiv2.className = "row text-center";
    } else if (targetDiv.className == "row text-center") {
        targetDiv.className = "row text-end";
        targetDiv2.className = "row text-end";
    } else {
        targetDiv.className = "row text-start";
        targetDiv2.className = "row text-start";
    }
}

function new_hobby() {
    let hobby = prompt("Please enter a hobby");

    if (hobby != null && hobby != "") {
        var div = document.createElement("div");
        var divattr = document.createAttribute("class");
        divattr.value = "m-2 p-3 bg-primary";
        div.setAttributeNode(divattr);
        div.innerHTML = hobby;

        document.getElementById("my-hobbies").append(div);
    } else {
        return;
    }
}

function scrollfunction() {
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrolled = (winScroll / height) * 100;
    document.getElementById("mybar").style.width = scrolled + "%";
}

function scrolll() {
    const targetDiv = document.getElementById("progress_bar");
    if (targetDiv.style.display == "none") {
        targetDiv.style.display = "block";
    } else {
        targetDiv.style.display = "none";
    }
}



function processform() {

    var x = document.forms["myform"]["name"].value;
    var y = document.forms["myform"]["comment"].value;
    console.log(x);
    const inpObj = document.getElementById("new-email");
    if (!inpObj.checkValidity() || y == "") {
        console.log(x == null);
        console.log(x == "");
        if (!inpObj.checkValidity()) {
            if (y != "") {
                //console.log("xx");
                document.getElementById("new-comment").classList.remove("is-invalid");
            }
            document.getElementById("new-email").classList.add("is-invalid");
        }
        if (y == "") {
            if (inpObj.checkValidity()) {
                //console.log(inpObj.checkValidity());
                document.getElementById("new-email").classList.remove("is-invalid");
            }
            document.getElementById("new-comment").classList.add("is-invalid");
        }
        return;
    }

    document.getElementById("new-email").classList.remove("is-invalid");
    document.getElementById("new-comment").classList.remove("is-invalid");


    // set up a new element
    let newComment = document.createElement("div");
    let element = '<div><svg height="100" width="100"><circle cx="50" cy="50" r="40"></svg></div><div><h5></h5><p></p></div>';
    newComment.innerHTML = element;

    // set the classes of the div and its children div's
    newComment.className = "d-flex";
    newComment.querySelectorAll("div")[0].className = "flex-shrink-0"; // 1st div
    newComment.querySelectorAll("div")[1].className = "flex-grow-1"; // 2nd div

    // increment the comment id
    let lastComment = document.querySelector("#comments").lastElementChild; // instead of lastChild for div element
    newComment.id = 'c' + (Number(lastComment.id.substr(1)) + 1);

    // change contents of <h5> and <p> according to form input with id
    newComment.querySelector("h5").innerHTML = document.querySelector("#new-email").value;
    newComment.querySelector("p").innerHTML = document.querySelector("#new-comment").value;

    // draw circle
    let color = document.querySelectorAll("input[name=new-color]:checked")[0].value; // look for checked radio buttons
    newComment.querySelector("circle").setAttribute("fill", color);

    // append to #comment
    document.querySelector("#comments").appendChild(newComment);

    // reset the form to clear contents
    document.querySelector("form").reset();

}

window.addEventListener("pageshow", loadfile);
document.getElementById("myform").addEventListener("submit", savefile);

function loadfile() {
    fetch('comments.txt')
        .then(res => res.text())
        .then(txt => document.querySelector("#comments").innerHTML = txt);
}

function savefile() {
    fetch('comments.txt', {
        method: 'PUT',
        body: document.querySelector("#comments").innerHTML
    });
}