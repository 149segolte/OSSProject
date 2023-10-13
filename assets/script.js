let selected = {};

function select(ques, option) {
    if (selected[ques] == undefined) {
        let element = document.getElementById(`option${option}`);
        element.classList.remove("bg-neutral-100");
        element.classList.remove("text-neutral-900");
        element.classList.add("bg-neutral-900");
        element.classList.add("text-white");
        selected[ques] = option;

        let group = document.getElementById("options");
        group.classList.add("opacity-50");
    }
}
