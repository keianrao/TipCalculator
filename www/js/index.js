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

var titlebar, subtotal, tax, options, final;

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
    return inputValidate(subtotal, getSubtotal);
}

function getSalesTax()
{
    return getMultiplier(tax.value);
}

function validateSalesTax()
{
    return inputValidate(tax, getSalesTax);
}

function recalculate()
{
    let valid = validateSubtotal();
    
    function nextInt(number)
    {
        return Math.floor(number + 1);
    }
    function fillCell(cell, value, clarification)
    {
        if (clarification == null)
        {
            cell.innerText = value.toFixed(2);
            return;
        }
        let v1 = value.toFixed(2);
        let v2 = clarification.toFixed(2);
        cell.innerText = v1 + " (" + v2 + ")";
    }

    for (let child of options.children)
    {
        if (child.tagName != "TR") continue;

        if (!valid)
        {
            child.children.item(1).innerText = "-";
            child.children.item(2).innerText = "-";
            child.children.item(3).innerText = "-";
            continue;
        }

        let percentageString = child.children.item(0).innerText;
        let multiplier = getMultiplier(percentageString);
        let subtotal = getSubtotal();
        let salesTax = getSalesTax();
        
        let straightforward = subtotal * multiplier;
        let rounded = nextInt(subtotal + straightforward) - subtotal;
        let r2 = (subtotal + straightforward) * (1 + salesTax);
        let roundedFinal = nextInt(r2) - subtotal;

        fillCell(child.children.item(1), straightforward, null);
        fillCell(child.children.item(2), rounded, null);
        fillCell(child.children.item(3), roundedFinal, r2);
    }
}

//   -  -%-  -

function withoutSuffix(string, suffix)
{
    if (!string.endsWith(suffix)) return string;
    return string.substring(0, string.length - suffix.length);
}

function getMultiplier(percentageString)
{
    return Number(withoutSuffix(percentageString, "%")) / 100;
}

function inputValidate(inputElement, numberGetter)
{
    let value = numberGetter();
    let valid = !Number.isNaN(value);

    if (!valid) inputElement.setAttribute("class", "error");
    else inputElement.removeAttribute("class");
    
    inputElement.value = value;
    return valid;
}

//  ---%-@-%---

function main()
{
    titlebar = document.getElementById("titlebar");
    subtotal = document.getElementById("subtotal");
    tax = document.getElementById("tax");
    options = document.getElementById("options");
    final = document.getElementById("final");
    
    populateOptions();

    subtotal.value = 8.70;
    subtotal.addEventListener("change", recalculate);
    subtotal.removeAttribute("disabled");
    tax.value = "13%";
    tax.addEventListener("change", recalculate);
    tax.removeAttribute("disabled");
    recalculate();

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