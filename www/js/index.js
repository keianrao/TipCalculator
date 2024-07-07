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

var titlebar, subtotal, rate, options, tax, after, tip, total;
var selected;

//  ---%-@-%---


function validateSubtotal()
{
    /*
    * The builtin validity mechanism of inputs seem interesting
    * but we still need a post-step to remove any optional
    * suffixes (or otherwise transform the value to a normative
    * form), and it kinda seems like new functionality, so I
    * won't be using it.
    */

    let value = subtotal.value;
    value = withoutPrefix(value, "$");
    value = withoutPrefix(value, "€");
    value = withoutPrefix(value, "£");
    // Let the Europeans have their fun here. Everyone else,
    // type solely numbers.
    value = Number(value);

    let valid = !Number.isNaN(value);
    if (!valid) subtotal.setAttribute("class", "error");
    else subtotal.removeAttribute("class");

    subtotal.value = value;
    return valid;
}

function validateSalesTax()
{
    let value = rate.value;
    value = withoutSuffix(value, "%");
    value = Number(value);

    let valid = !Number.isNaN(value);
    if (!valid) rate.setAttribute("class", "error");
    else rate.removeAttribute("class");

    rate.value = value;
    return valid;
}

function getValidatedSubtotal()
{
    return Number(subtotal.value);
}

function getValidatedSalesTax()
{
    return getMultiplier(rate.value);
}

function recalculate()
{
    function nextInt(number)
    {
        return Math.floor(number + 1);
    }
    function intoCell(cell, value)
    {
        let a = cell.firstElementChild;
        a.innerText = value.toFixed(2);
    }
    function fromCell(cell)
    {
        let a = cell.firstElementChild;
        return Number(a.innerText);
    }

    let valid = validateSubtotal() && validateSalesTax();
    if (!valid)
    {
        for (let child of options.children)
        {
            if (child.tagName != "TR") continue;
            child.children.item(1).innerText = "-";
            child.children.item(2).innerText = "-";
            child.children.item(3).innerText = "-";
        }
        after.innerText = "-";
        tip.innerText = "-";
        total.innerText = "-";
        return;
    }

    let subtotal = getValidatedSubtotal();
    let salesTax = getValidatedSalesTax();

    let taxToPay = subtotal * salesTax;
    let subtotalAfter = subtotal + taxToPay;
    let tipToPay = selected ? fromCell(selected) : 0;
    let grandTotal = subtotalAfter + tipToPay;
    
    tax.innerText = taxToPay.toFixed(2);
    after.innerText = subtotalAfter.toFixed(2);
    tip.innerText = tipToPay.toFixed(2);
    total.innerText = grandTotal.toFixed(2);
    
    for (let child of options.children)
    {
        if (child.tagName != "TR") continue;

        let multiplier = getMultiplier(child.children.item(0).innerText);
        
        let straightforward = subtotal * multiplier;
        intoCell(child.children.item(1), straightforward);
        
        let rounded = nextInt(subtotal + straightforward) - subtotal;
        intoCell(child.children.item(2), rounded);
        
        let roundedTotal = nextInt(subtotal + straightforward + taxToPay) - subtotalAfter;
        intoCell(child.children.item(3), roundedTotal);
    }
}

//   -  -%-  -

function withoutSuffix(string, suffix)
{
    if (!string.endsWith(suffix)) return string;
    return string.substring(0, string.length - suffix.length);
}

function withoutPrefix(string, prefix)
{
    if (!string.startsWith(prefix)) return string;
    return string.substring(prefix.length);
}

function getMultiplier(percentageString)
{
    return Number(withoutSuffix(percentageString, "%")) / 100;
}

function selectCell(cell)
{
    selected = cell;
    recalculate();
}

//  ---%-@-%---

function main()
{
    titlebar = document.getElementById("titlebar");
    subtotal = document.getElementById("subtotal");
    rate = document.getElementById("rate");
    options = document.getElementById("options");
    tax = document.getElementById("tax");
    after = document.getElementById("after");
    tip = document.getElementById("tip");
    total = document.getElementById("total");
    
    populateOptions();
    setupInputs();
    recalculate();
}

function populateOptions()
{
    function selector(cell) {
        let a = document.createElement("a");
        a.innerText = "-";
        a.setAttribute("href", "");
        a.addEventListener("click", function(eM) {
            selectCell(cell);
            eM.preventDefault();
        });
        return a;
    }

    for (let percentage = 0; percentage <= 200;)
    {
        let percentageCell = document.createElement("th");
        percentageCell.innerText = percentage + "%";

        let straightforwardCell = document.createElement("td");
        straightforwardCell.appendChild(selector(straightforwardCell));
        
        let roundedCell = document.createElement("td");
        roundedCell.appendChild(selector(roundedCell));
        
        let roundedTotalCell = document.createElement("td");
        roundedTotalCell.appendChild(selector(roundedTotalCell));

        let row = document.createElement("tr");
        row.appendChild(percentageCell);
        row.appendChild(straightforwardCell);
        row.appendChild(roundedCell);
        row.appendChild(roundedTotalCell);
        options.appendChild(row);

        if (percentage < 50) ++percentage;
        else percentage += 5;
    }
}

function setupInputs()
{    
    subtotal.value = 8.70;
    subtotal.addEventListener("change", recalculate);
    subtotal.removeAttribute("disabled");
    
    rate.value = "13%";
    rate.addEventListener("change", recalculate);
    rate.removeAttribute("disabled");
}

window.addEventListener("load",  main);