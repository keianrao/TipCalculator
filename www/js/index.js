/*copyright
This file is part of TipCalculator.
Written in 2024 by Keian Rao <keian.rao@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
copyright*/

var titlebar, subtotal, options, final;

//  ---%-@-%---

function getSubtotal()
{
    let value = subtotal.value;
    
    if (value.startsWith("$")) value = value.substring(1);
    if (value.startsWith("€")) value = value.substring(1);
    if (value.startsWith("£")) value = value.substring(1);
    // Let the Europeans have their fun here. Everyone else,
    // type solely numbers.

    value = Number(value);
    return value;
}

function validateSubtotal()
{
    /*
    * The builtin validity mechanism of inputs seem interesting
    * but we still need a post-step to remove any optional
    * suffixes (or otherwise transform the value to a normative
    * form), and it kinda seems like new functionality, so I
    * won't be using it.
    */
    let value = getSubtotal(), valid = value != NaN;
    subtotal.setAttribute("class", valid ? "" : "error");
    subtotal.value = value;
}

//  ---%-@-%---

function main()
{
    titlebar = document.getElementById("titlebar");
    subtotal = document.getElementById("subtotal");
    options = document.getElementById("options");
    final = document.getElementById("final");

    subtotal.removeAttribute("disabled");
    subtotal.addEventListener("change", validateSubtotal);

    populateOptions();
}

function populateOptions()
{
    for (let percentage = 0; percentage <= 200;)
    {
        let percentageCell = document.createElement("th");
        percentageCell.innerText = percentage + "%";

        let straightforwardCell = document.createElement("td");
        straightforwardCell.innerText = "-";

        let roundedCell = document.createElement("td");
        roundedCell.innerText = "-";
        
        let roundedFinalCell = document.createElement("td");
        roundedFinalCell.innerText = "-";

        let row = document.createElement("tr");
        row.appendChild(percentageCell);
        row.appendChild(straightforwardCell);
        row.appendChild(roundedCell);
        row.appendChild(roundedFinalCell);
        options.appendChild(row);

        if (percentage < 50) ++percentage;
        else percentage += 5;
    }
}

window.addEventListener("load",  main);