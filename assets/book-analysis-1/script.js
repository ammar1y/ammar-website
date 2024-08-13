let d3wc_cloud;

let table = (data, options) => {
    options = Object.assign({}, tableDefaultOptions, options);
    const { sortable, rank, paged } = options;
    let sortKey = undefined;
    let sortDirection = true;
    let page = 0;
    if (sortable && rank) {
        throw new Error("A table can either be ranked or sortable, but not both");
    }
    let columns = Object.keys(data[0]).map(key => {
        const opts = options.columns[key] || {};
        return {
            key: key,
            type: opts.type || typeof data[0][key],
            options: opts
        };
    });

    function bake() {
        if (sortKey) {
            data = data.slice().sort((a, b) => {
                let as = a[sortKey];
                let bs = b[sortKey];
                // make this sort stable
                if (as == bs) return JSON.stringify(a).localeCompare(JSON.stringify(b));
                let res = as > bs ? 1 : as < bs ? -1 : 0;
                if (sortDirection) res = -res;
                return res;
            });
        }
        let offset = page * paged;
        let rows = data.slice(offset, offset + (paged || data.length));
        let pages = paged ? Math.ceil(data.length / paged) : 1;

        function createStyles() {
            return `
                <style>
                .pretty-pager {
                    padding-top: 1rem;
                }
                .pretty-pager button {
                    cursor: pointer;
                    border-radius: 3px;
                    border: 1px solid #fff;
                    font-size: inherit;
                }
                .pretty-pager button:hover {
                    border: 1px solid #888;
                }
                .pretty-table.normal {
                    font-size: 15px;
                }
                .pretty-table.normal th,
                .pretty-table.normal td {
                    padding: 3px 2px;
                }
                .pretty-table th,
                .pretty-table td {
                    vertical-align: top;
                }
                .pretty-table thead th {
                    text-transform: uppercase;
                    font-weight:500;
                }
                .pretty-table thead th.column-type-number string {
                    order: 1;
                }
                .pretty-table th.sortable {
                    cursor: pointer;
                }
                .pretty-table thead th.column-type-number,
                .pretty-table tbody td.cell-type-number,
                .pretty-table tbody td.cell-rank {
                    text-align:right;
                }
                .pretty-table tbody td.cell-type-number,
                .pretty-table tbody td.cell-rank {
                    font-family: menlo,consolas,monaco,monospace;
                    font-size: 90%;
                }
                .pretty-table tbody td.cell-rank {
                    padding-right: 1em;
                    color: #666;
                }

                .pretty-table tr {
                    background-color: transparent !important;
                }
                .pretty-table td {
                    border: none;
                    color: #444;
                }

                .pretty-table tr:not(:last-child) {
                    border-bottom: solid 1px #eee;
                }

                .pretty-table {
                    border: none;
                }

                .pretty-table th {
                    background-color: transparent;
                    border: none;
                    color: #111;
                }

                .pretty-table-con {
                    width: 100%;
                    overflow-x: auto;
                }                                  
                </style>
            `;
        }

        function createTableHeader(rank, columns, sortKey, sortDirection, sortable) {
            const headerColumns = columns.map(c => th(c, sortKey, sortDirection, sortable)).join('');
            return rank ? `<th></th>${headerColumns}` : headerColumns;
        }

        function createTableBody(rows, rank, columns, offset) {
            return rows.map((row, i) => {
                const rankCell = rank ? `<td class='cell-rank'>${offset + i + 1}</td>` : "";
                const dataCells = columns.map(c => {
                    const displayValue = (c.options.formatter || identity)(row[c.key], i, row);
                    const cellContent = displayValue instanceof window.HTMLElement && displayValue.tagName === "TD"
                        ? displayValue.outerHTML
                        : `<td class='cell-type-${c.type}'>${displayValue}</td>`;
                    return cellContent;
                }).join('');
                return `<tr>${rankCell}${dataCells}</tr>`;
            }).join('');
        }

        function createPager(pages) {
            const buttons = Array.from({ length: pages }, (_, i) => `<button data-page="${i}">${i + 1}</button>`).join('');
            return `<div class='pretty-pager'><button data-action="previous">Previous</button>${buttons}<button data-action="next">Next</button></div>`;
        }

        function createTable(options, rank, columns, sortKey, sortDirection, sortable, rows, offset, pages) {
            const header = options.header === false ? '' : `<thead>${createTableHeader(rank, columns, sortKey, sortDirection, sortable)}</thead>`;
            const body = `<tbody>${createTableBody(rows, rank, columns, offset)}</tbody>`;
            const pager = pages > 1 ? createPager(pages) : '';
            const styles = createStyles();

            return $(`<div class='pretty-table-con'>${styles}<table class='pretty-table ${options.style}'>${header}${body}</table>${pager}</div>`)[0];
        }

        return createTable(options, rank, columns, sortKey, sortDirection, sortable, rows, offset, pages);

    }

    let dom = bake();

    function rerender() {
        dom.firstChild.remove();
        dom.appendChild(bake().firstChild);
    }

    dom.addEventListener("click", e => {
        if (e.target.tagName === "TH" && sortable) {
            if (sortKey == e.target.dataset.key) {
                sortDirection = !sortDirection;
            }
            sortKey = e.target.dataset.key;
            rerender();
        }
        if (e.target.tagName === "BUTTON") {
            if (e.target.dataset.action) {
                switch (e.target.dataset.action) {
                    case "next":
                        page++, rerender();
                        break;
                    case "previous":
                        page--, rerender();
                        break;
                }
            } else if (e.target.dataset.page) {
                (page = parseInt(e.target.dataset.page)), rerender();
            }
        }
    });

    return dom;
}

function humanFormatNumber(num, decimalPlaces = 1) {
    // Function to format the number based on whether it's an integer or not
    function format(value, divisor, suffix) {
        let result = value / divisor;
        // Check if the result is an integer
        if (result % 1 === 0) {
            return result + suffix;
        } else {
            return result.toFixed(decimalPlaces) + suffix;
        }
    }

    // Check if the number is less than a thousand
    if (num < 1000) {
        return num.toString();
    }
    // Format for thousands
    else if (num < 1000000) {
        return format(num, 1000, "K");
    }
    // Format for millions
    else if (num < 1000000000) {
        return format(num, 1000000, "M");
    }
    // Format for billions
    else {
        return format(num, 1000000000, "B");
    }
}



const tableDefaultOptions = ({ columns: {}, style: 'normal', paged: 25 });
const identity = i => i;
let th = (c, sortKey, sortDirection, sortable) => {
    let {
        options: { title }
    } = c;
    let sortIndicator = sortKey && sortDirection ? "↑" : "↓";
    let arrow = `<span style='${sortKey === c.key ? "" : "visibility:hidden"
        }'>${sortIndicator}</span>`;
    let displayedTitle = title !== undefined ? title : c.key;
    return c.type === "number"
        ? `<th
                data-key="${c.key}"
                class='column-type-${c.type} ${sortable ? "sortable" : ""}'>
                  ${arrow}${displayedTitle}
              </th>`
        : `<th
                data-key="${c.key}"
                class='column-type-${c.type} ${sortable ? "sortable" : ""}'>
                  ${displayedTitle}${arrow}
              </th>`;
}


// function generateLogScaleArray(maxPower) {
//     let array = [0];

//     for (let power = 0; power < maxPower; power++) {
//         // Note the change here
//         let base = Math.pow(10, power);
//         for (let i = 1; i < 10; i++) {
//             let value = base * i;
//             array.push(value);
//         }
//     }

//     array.push(Math.pow(10, maxPower)); // Add the final value
//     console.log("array",array);
//     return array;
// }

function generateLogScaleArray(maxVal) {
    let array = [0];

    // Start from the smallest power of 10 that is less than or equal to maxVal
    let maxPower = Math.floor(Math.log10(maxVal));

    for (let power = 0; power <= maxPower; power++) {
        let base = Math.pow(10, power);
        for (let i = 1; i < 10; i++) {
            let value = base * i;
            if (value > maxVal) {
                // Stop if value exceeds maxVal, and ensure the array ends with a value just above maxVal
                if (Math.pow(10, power) !== maxVal) { // Check if maxVal is not a power of 10
                    array.push(value);
                }
                return array;
            }
            array.push(value);
        }
    }

    // Handle case where maxVal is exactly a power of 10
    if (Math.pow(10, maxPower) === maxVal) {
        array.push(maxVal);
    }

    return array;
}

const wrapperXPadding = d3
    .select(".wrapper")
    .style("padding-left")
    .slice(0, -2);

$('div.chart-con').each(function () {
    $(this).wrap('<div class="chart-con-con"></div>');
});

function replaceTextInNode(node, search, replace) {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
    let currentNode;

    while (currentNode = walker.nextNode()) {
        currentNode.nodeValue = currentNode.nodeValue.replace(new RegExp(search, 'g'), replace);
    }
}

function replaceAllOccurrences(search, replace) {
    replaceTextInNode(document.body, search, replace);
}

// Usage example:
replaceAllOccurrences('Hover over', 'Click on');

let processData = function (event) {

    var screenWidth = window.screen.width;
    var deviceType;
    if (screenWidth <= 600) {
        deviceType = "mobile";
    } else if (screenWidth <= 991) {
        deviceType = "tablet";
    } else {
        deviceType = "desktop";
    }

    var chartWidth = 800;
    if (deviceType != "desktop") {
        chartWidth = screenWidth - 2 * wrapperXPadding;
    }

    // ---------------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------------

    let createBarChart = (fileName, chartId, metric) => {
        d3.json(`/assets/book-analysis-1/data/${fileName}.json`)
            .then(function (data) {
                data = data.filter((d) => d.type == bookTypeFilter);
                // console.log(data);
                const labelWidth = deviceType == "desktop" ? 800 : screenWidth;
                const imgWidth = deviceType == "desktop" ? 42 : 42,
                    imgHeight = deviceType == "desktop" ? 64 : 64;
                const height = 600;
                const imgMargin = 5,
                    labelMargin = 5,
                    barMargin = 5,
                    barPadding = 5,
                    barConMargin = 5;
                const barWidth = chartWidth - imgWidth - imgMargin - barMargin,
                    barHeight = 22;

                data = data.slice(0, 15);

                const x = d3
                    .scaleLinear()
                    .domain([0, d3.max(data, (d) => parseInt(d[metric]))])
                    .range([0, barWidth]);

                const chart = d3.select("#" + chartId);

                const t = chart.transition().duration(750);

                const bars = chart
                    .selectAll("div.bar-con")
                    .data(data, (d) => d.id)
                    // .join("div")
                    // .attr("class", "bar-con")


                    .join(
                        enter => enterFunc(enter),
                        update => updateFunc(update),
                        exit => exitFunc(exit)
                    );


                function enterFunc(enter) {
                    // console.log("enter xxz", enter);
                    return enter.append("div")
                        .attr("class", "bar-con")
                        .style("transform", "translateX(-300px)")
                        .style("opacity", 0)
                        .call(enter => enter
                            .append("div")
                            .attr("class", "img-bar-con")
                            .call(imgBarCon => imgBarCon
                                .append("div")
                                .append("a")
                                .attr("href", (d) => "https://www.goodreads.com/book/show/" + d.id)
                                .attr("target", "_blank")
                                .attr("class", "bar-link")
                                .append("div")
                                .attr("class", "img-con")
                                .style("width", imgWidth + "px")
                                .style("height", imgHeight + "px")
                                .style("background-image", (d) => `url("${d.image_url}")`)
                                .style("margin-right", imgMargin + "px")
                            )
                            .append("div")
                            .attr("class", "rect-con")
                            .style("width", (d) => x(d[metric]) + "px")
                            .style("height", barHeight + "px")
                            .style("margin-left", barMargin + "px")

                            .append("span")
                            .attr("class", "bar-text")
                            .html((d) =>
                                deviceType == "desktop"
                                    ? d3.format(",")(d[metric])
                                    : humanFormatNumber(d[metric])
                            )
                        )
                        .call(enter => enter
                            .append("div")
                            .attr("class", "bar-label-con")
                            .html(function (d) {
                                return d.title;
                            })
                        )
                        .call(enter => enter
                            .transition(t).delay((d, i) => 150 + i * 50)
                            .style("transform", "translateX(0px)").style("opacity", 1)
                        )
                }

                function updateFunc(update) {
                    return update
                        // .call(update => update
                        //     .transition(t)
                        //     .delay((d, i) => i * 50)
                        //     .style("transform", "translateX(0px)")
                        //     .style("opacity", 1)
                        // )
                        .call(update => update
                            .select(".rect-con")
                            .transition(t)
                            .delay((d, i) => i * 50)
                            .style("width", (d) => x(d[metric]) + "px")
                        );
                    // .call(update => update
                    //     .select(".bar-text")
                    //     .html((d) =>
                    //         deviceType == "desktop"
                    //             ? d3.format(",")(d[metric])
                    //             : humanFormatNumber(d[metric])
                    //     )
                    // )
                    // .call(update => update
                    //     .select(".bar-label-con")
                    //     .html(function (d) {
                    //         return d.title;
                    //     })
                    // );
                }

                function exitFunc(exit) {
                    // console.log("exit xxz", exit);
                    exit
                        .style("position", "absolute")
                        .call(exit => exit
                            .transition(t)
                            .delay((d, i) => i * 50)
                            .style("transform", "translateX(-300px)")
                            .style("opacity", 0).remove());
                }


                const barTooltip = d3
                    .select("body")
                    .selectAll(`.bar-tooltip-${chartId}`)
                    .data([true])
                    .join("div")
                    .attr("class", `bar-tooltip-${chartId}`)
                    .style("opacity", 0);

                const showTooltipFunc = function (event, d) {
                    // if (event.target.className == "bar-con") return;
                    // barTooltip.style("opacity", 0);
                    barTooltip.html(
                        `<span class="tt-head">${d.title}</span> <br> 
                        By ${d.author_name} <br> 
                        <span class="tt-stat">${d3.format(",")(d[metric])}</span> ratings`
                    );
                    barTooltip
                        .transition()
                        .duration(200)
                        .ease(d3.easePoly.exponent(2))
                        .style("opacity", 1)
                        .style(
                            "left",
                            (deviceType == "desktop" ? event.pageX : 80) + "px"
                        )
                        .style("top", event.pageY - 28 + "px");
                };

                const hideTooltipFunc = function (event, d) {
                    barTooltip.transition().duration(100).style("opacity", 0);
                };

                const barRects = d3.selectAll(`#${chartId} .rect-con`);
                barRects
                    .on("mouseover", showTooltipFunc)
                    .on("touchstart", showTooltipFunc)
                    .on("mouseout", hideTooltipFunc)
                    .on("touchend", hideTooltipFunc);
            })
            .catch(function (error) {
                console.error("Error loading the CSV file:", error);
            });
    };




    let createBarChart_2 = (data1, data2, chartId, metric, categoryField, tooltipLabel, barColor = "blue") => {
        const width = 1200;
        const height = deviceType != "mobile" ? 600 : 820;
        const margin = deviceType != "mobile" ? { top: 0, right: 230, bottom: 60, left: 140 } : { top: 0, right: 230, bottom: 60, left: 140 };
        const svg = d3.select("#" + chartId)
            .selectAll("svg")
            .data([true])
            .join("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data1, d => d[metric])])
            .range([margin.left, width - margin.right]);

        const yScale = d3.scaleBand()
            .domain(data1.map(d => d[categoryField]))
            .range([margin.top, height - margin.bottom])
            .padding(0.35);


        svg.selectAll("line.verticalGrid")
            .data(xScale.ticks(4))
            .join("line")
            .attr("class", "verticalGrid")
            .attr("x1", d => xScale(0) + xScale(d))
            .attr("x2", d => xScale(0) + xScale(d))
            .attr("y1", margin.top)
            .attr("y2", height)
            .attr("stroke", "lightgrey")
            .attr("stroke-dasharray", "10 10")
            .attr("stroke-width", "1px");



        const svg_g = svg.selectAll('g.svg_g')
            .data([true])
            .join('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "svg_g");

        const t = svg_g.transition().duration(3000);
        const bars = svg_g.selectAll("rect.bar")
            .data(data1, d => d[categoryField])
            .join(
                enter => enter
                    // .call(enter => enter
                    // .append("line")
                    // .attr("x1", xScale(0))
                    // .attr("x2", d => xScale(0) + xScale(d[metric]))
                    // .attr("y1", d => yScale(d[categoryField]))
                    // .attr("y2", d => yScale(d[categoryField]))
                    // .attr("stroke", "steelblue")
                    // .attr("stroke-width", 2)
                    // .attr("class", "bar")
                    // .style("opacity", 0)
                    // .transition(t)
                    // .style("opacity", 1))
                    // .append("circle")
                    // .attr("fill", d => d3.schemeSet1[d.value > 0 ? 1 : 0])
                    // .attr("cx", d => xScale(0) + xScale(d[metric]))
                    // .attr("cy", d => yScale(d[categoryField]))
                    // .attr("r", 6), // xx use separate enter and update

                    .append("rect")
                    .attr("class", "bar")
                    // .attr("rx", 5)
                    // .attr("ry", 5)
                    .attr("x", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * width)
                    .attr("y", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * height)
                    .style("opacity", 0)
                    .transition(t)
                    .style("opacity", 1)
                    .attr("x", xScale(0))
                    .attr("y", d => yScale(d[categoryField]))
                    .attr("width", d => xScale(d[metric]) - xScale(0))
                    .attr("height", yScale.bandwidth()),
                update => update
                    .attr("x", xScale(0))
                    .transition(t)
                    .attr("y", d => yScale(d[categoryField]))
                    .attr("width", d => xScale(d[metric]) - xScale(0))
                    .attr("height", yScale.bandwidth()),
                exit => exit
                    .style("position", "absolute")
                    .call(exit => exit
                        .transition(t)
                        // .delay((d, i) => i * 50)
                        // move to random position
                        .attr("x", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * width)
                        .attr("y", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * height)
                        // .style("transform", "tra")
                        .style("opacity", 0).remove())
            )
            ;
        // .attr("fill", "steelblue");

        svg_g.selectAll("text.label-count")
            .data(data1, d => d[categoryField])
            .join(
                enter => enter
                    .append("text")
                    .attr("class", "label-count")
                    .attr("dy", "0.35em")
                    .text(d => d3.format(',')(d[metric]))
                    .style("opacity", 0)
                    .attr("x", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * width)
                    .attr("y", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * height)
                    .transition(t)
                    .attr("x", d => xScale(0) + xScale(d[metric]) - xScale(0) + 5)
                    .attr("y", d => yScale(d[categoryField]) + yScale.bandwidth() / 2)
                    .style("opacity", 1)
                    .attr('fill', 'gray'),
                update => update
                    .style("opacity", 0)
                    .transition(t)
                    .style("opacity", 1)
                    .text(d => d3.format(',')(d[metric]))
                    .attr("x", d => xScale(0) + xScale(d[metric]) - xScale(0) + 5)
                    .attr("y", d => yScale(d[categoryField]) + yScale.bandwidth() / 2),
                exit => exit
                    .style("position", "absolute")
                    .call(exit => exit
                        .transition(t)
                        .attr("x", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * width)
                        .attr("y", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * height)
                        .style("opacity", 0).remove())
            );

        svg_g.selectAll("text.label-name")
            .data(data1, d => d[categoryField])
            .join(
                enter => enter
                    .append("text")
                    .attr("class", "label-name")
                    .attr("dy", "0.35em")
                    // .text(d => d[categoryField])
                    .text(d => deviceType != "mobile" ? (d[categoryField].substring(0, 32) + (d[categoryField].length > 32 ? "..." : "")) : (d[categoryField].substring(0, 20) + (d[categoryField].length > 20 ? "..." : "")))
                    .attr("text-anchor", "end")
                    .style("opacity", 0)
                    .attr("x", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * width)
                    .attr("y", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * height)
                    .transition(t)
                    .attr("x", d => xScale(0) - 5)
                    .attr("y", d => yScale(d[categoryField]) + yScale.bandwidth() / 2)
                    .style("opacity", 1),
                update => update
                    .transition(t)
                    .attr("x", d => xScale(0) - 5)
                    .attr("y", d => yScale(d[categoryField]) + yScale.bandwidth() / 2),
                exit => exit
                    .style("position", "absolute")
                    .call(exit => exit
                        .transition(t)
                        .attr("x", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * width)
                        .attr("y", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * height)
                        .style("opacity", 0).remove())
            );



            let xAxg = svg
                .selectAll("g.x-axis")
                .data([true])
                .join("g")
                .attr("class", "x-axis");

            xAxg
                .attr("transform", `translate(${margin.left}, ${height - 20})`)
                .call((g) =>
                    g
                        .append("text")
                        .attr("x", width)
                        .attr("y", margin.bottom - 4)
                        .attr("fill", "currentColor")
                        .attr("text-anchor", "end")
                        .text("Number of Books →")
                )
                .transition()
                .duration(750)
                .call(
                    d3
                        .axisBottom(xScale)
                        .ticks(4)
                        .tickFormat((d) => humanFormatNumber(d))
                        .tickSizeOuter(0)
                        .tickSize(0)
                )
                .call(g => g.select(".domain").remove());


            // let yAxg = g
            //     .selectAll("g.y-axis")
            //     .data([true])
            //     .join("g")
            //     .attr("class", "y-axis");

            // const yTickValues = generateLogScaleArray(yScale.domain()[1]);

            // // Add the y-axis and label, and remove the domain line.
            // yAxg
            //     .attr("transform", `translate(${marginLeft},0)`)
            //     .call((g) => g.select(".domain").remove())
            //     .call((g) =>
            //         g
            //             .append("text")
            //             .attr("x", -marginLeft)
            //             .attr("y", 10)
            //             .attr("fill", "currentColor")
            //             .attr("text-anchor", "start")
            //             .text("↑ Frequency (no. of books)")
            //     )
            //     .transition()
            //     .duration(750)
            //     .call(
            //         d3
            //             .axisLeft(yScale)
            //             // .ticks(-10)
            //             .tickValues(yTickValues)
            //             // .tickValues()
            //             .tickFormat((d) =>
            //                 // console.log("yTickValues", yTickValues, "Math.max(yTickValues)", Math.max(yTickValues), d, Math.log10(d) % 1 === 0, d == Math.max(yTickValues), (Math.log10(d) % 1 === 0) || (d == Math.max(yTickValues)))
            //                 (Math.log10(d) % 1 === 0) || (d == Math.max(...yTickValues)) ? humanFormatNumber(d) : ""
            //             )
            //             .tickSizeOuter(0)
            //     );



        const tooltip = d3
            .select("body")
            .selectAll('div.author-top-works-tooltip')
            .data([true])
            .join("div")
            .attr("class", "author-top-works-tooltip") // xx same class for all tooltipl??!!
            .style("opacity", 0);

        let showTooltipFunc = function (event, d) {
            let top_works = data2.filter((d2) => d2[categoryField] == d[categoryField]);
            tooltip.html(
                `
                <strong>${d[categoryField]}</strong> <br>
                ${tooltipLabel[0]} ${d3.format(",")(d[metric])} ${tooltipLabel[1]} <br>
                <hr>
                <strong class="tt-works-title">${tooltipLabel[2]}</strong> <br>
                <div class="tt-works">
                ${top_works.map(d => `<div class='a-top-work'>
                                            <div><img src=${d.image_url} /></div> 
                                            <div>
                                                <p class="tt-bk-title">${d.title}</p>
                                                <p><span class="rstar material-symbols-outlined">star</span>${d3.format(".2f")(d.average_rating)} 
                                                (${humanFormatNumber(d.ratings_count)} ratings)</p>
                                            </div>
                                        </div>`).join(" ")
                }
                </div>
                `
            );
            tooltip
                .transition()
                .duration(200)
                .ease(d3.easePoly.exponent(1))
                .style("opacity", 1)
                .style(
                    "left",
                    (deviceType == "desktop" ? event.pageX : 80) + "px"
                )
                .style("top", event.pageY - 28 + "px");
        };

        let hideTooltipFunc = function (event, d) {
            tooltip.transition().duration(100).style("opacity", 0);
        };
        bars.on("mouseover", showTooltipFunc);
        bars.on("mouseout", hideTooltipFunc);
    }



    // let chartFuncs = {}
    // const viewportHeight = window.innerHeight;

    // function callback(entries, observer) {
    //     entries.forEach((entry) => {
    //     if(entry.isIntersecting) {
    //         chartFuncs[entry.target.id]();
    //     } else {
    //     }
    //     });
    // }

    // const observerOptions = {
    //     root: null,
    //     rootMargin: '0px 0px 0px 0px',
    //     threshold: 0.01
    // };
    // const observer = new IntersectionObserver(callback, observerOptions);

    function mostReviewedBooksFunc() {
        createBarChart(
            "most_reviewed_books",
            "most-reviewed-books-chart",
            "text_reviews_count"
        );
    }

    mostReviewedBooksFunc();
    // chartFuncs["most-reviewed-books-chart"] = mostReviewedBooksFunc;
    // observer.observe(document.getElementById("most-reviewed-books-chart"));

    createBarChart(
        "most_rated_books",
        "most-rated-books-chart",
        "ratings_count"
    );





    // ---------------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------------

    d3.json("/assets/book-analysis-1/data/books_55_rating.json")
        .then(function (data) {
            const val = data[bookTypeFilter];
            $("#num_55_rating").html(d3.format(",")(val));
        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });

    // ---------------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------------

    d3.json("/assets/book-analysis-1/data/ratings_count_hists.json")
        .then(function (data) {
            data = data[bookTypeFilter];
            const inset = 1;
            const marginTop = 35; // top margin, in pixels
            const marginRight = 20; // right margin, in pixels
            const marginBottom = 45; // bottom margin, in pixels
            const marginLeft = 40; // left margin, in pixels
            const width = 800; // outer width of chart, in pixels
            const height = 500; // outer height of chart, in pixels

            // const thresholds = data["bin_edges"];

            // let bins = thresholds
            //     .map((currentValue, index, array) => {
            //         if (index < array.length - 1) {
            //             return { x0: currentValue, x1: array[index + 1] };
            //         }
            //     })
            //     .filter(Boolean); // This filter removes the undefined value from the last iteration

            // const Y = data["frequencies"]; // .map(value => value == 0 ? 0.001 : value)

            const xScale = d3.scaleLinear(
                [0, d3.max(data.map((d) => d.x1))],
                [marginLeft, width - marginRight]
            );
            const yScale = d3
                .scaleSymlog(
                    [0, d3.max(data.map((d) => d.freq))],
                    [height - marginBottom, marginTop]
                )
                .constant(1)
                .clamp(true)
                .nice();

            const svg = d3
                .select("#ratings-hist-chart")
                .selectAll("svg")
                .data([true])
                .join("svg")

                // .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr(
                    "style",
                    "max-width: 100%; height: auto; height: intrinsic;"
                );

            // svg.append("linearGradient")
            //     .attr("id", "area-gradient")
            //     .attr("gradientUnits", "userSpaceOnUse")
            //     .attr("x1", "100%")
            //     .attr("y1", "0%")
            //     .attr("x2", "0%")
            //     .attr("y2", "0%")
            //     .selectAll("stop")
            //     .data([
            //         { offset: "0%", color: "navy" },
            //         // add additional steps as needed for gradient.
            //         { offset: "95%", color: "transparent" },
            //     ])
            //     .enter()
            //     .append("stop")
            //     .attr("offset", function (d) {
            //         return d.offset;
            //     })
            //     .attr("stop-color", function (d) {
            //         return d.color;
            //     });

            const gradientHTML = `
                <linearGradient id="myGradient" gradientUnits="userSpaceOnUse" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" style="stop-color: #003f5c;" />
                    <stop offset="25%" style="stop-color: #58508d;" />
                    <stop offset="50%" style="stop-color: #bc5090;" />
                    <stop offset="75%" style="stop-color: #ff6361;" />
                    <stop offset="100%" style="stop-color: #ffa600;" />
                </linearGradient>`;

            // const parser = new DOMParser();
            // const doc = parser.parseFromString(gradientHTML, 'application/xml');
            // const gradNode = doc.documentElement;
            // svg.node().appendChild(gradNode);

            svg.append("defs").html(gradientHTML);

            const g = svg
                .selectAll("g.histogram")
                .data([true])
                .join("g")
                .attr("class", "histogram");

            let rects = g
                // .attr("fill", "url(#area-gradient)")
                .attr("fill", "#003F5C")
                .attr("fill", "url(#myGradient)")
                .selectAll("rect")
                .data(data)
                .join("rect")
                // .attr("fill", "linear-gradient(180deg, #fff, #ddd)")
                .attr("x", (d) => xScale(d.x0) + inset)
                .attr("width", (d) =>
                    Math.max(0, xScale(d.x1) - xScale(d.x0) - inset)
                )
                .attr("y", (d, i) => yScale(d.freq))
                .attr("height", (d, i) => yScale(0) - yScale(d.freq));

            let histTooltip = d3
                .select("body")
                .selectAll("div.hist-tooltip")
                .data([true])
                .join("div")
                .attr("class", "hist-tooltip")
                .style("opacity", 0);

            let showTooltipFunc = function (event, d) {
                histTooltip.html(
                    `<strong>${d3.format(",")(d.freq)}</strong> books have a number of ratings between <strong>${humanFormatNumber(d.x0, 2)}</strong> and <strong>${humanFormatNumber(d.x1, 2)}</strong>`
                );
                histTooltip
                    .transition()
                    .duration(200)
                    .ease(d3.easePoly.exponent(1))
                    .style("opacity", 1)
                    .style(
                        "left",
                        (deviceType == "desktop" ? event.pageX : 80) + "px"
                    )
                    .style("top", event.pageY - 28 + "px");
            };

            let hideTooltipFunc = function (event, d) {
                histTooltip.transition().duration(100).style("opacity", 0);
            };

            rects
                .on("mouseover", showTooltipFunc)
                .on("touchstart", showTooltipFunc)
                .on("mouseout", hideTooltipFunc)
                .on("touchend", hideTooltipFunc);

            let xAxg = g
                .selectAll("g.x-axis")
                .data([true])
                .join("g")
                .attr("class", "x-axis");

            xAxg
                .attr("transform", `translate(0,${height - marginBottom})`)
                .call((g) =>
                    g
                        .append("text")
                        .attr("x", width)
                        .attr("y", marginBottom - 4)
                        .attr("fill", "currentColor")
                        .attr("text-anchor", "end")
                        .text("Rating count →")
                )
                .transition()
                .duration(750)
                .call(
                    d3
                        .axisBottom(xScale)
                        .ticks(10)
                        .tickFormat((d) => humanFormatNumber(d))
                        .tickSizeOuter(0)
                );


            let yAxg = g
                .selectAll("g.y-axis")
                .data([true])
                .join("g")
                .attr("class", "y-axis");

            const yTickValues = generateLogScaleArray(yScale.domain()[1]);

            // Add the y-axis and label, and remove the domain line.
            yAxg
                .attr("transform", `translate(${marginLeft},0)`)
                .call((g) => g.select(".domain").remove())
                .call((g) =>
                    g
                        .append("text")
                        .attr("x", -marginLeft)
                        .attr("y", 10)
                        .attr("fill", "currentColor")
                        .attr("text-anchor", "start")
                        .text("↑ Frequency (no. of books)")
                )
                .transition()
                .duration(750)
                .call(
                    d3
                        .axisLeft(yScale)
                        // .ticks(-10)
                        .tickValues(yTickValues)
                        // .tickValues()
                        .tickFormat((d) =>
                            // console.log("yTickValues", yTickValues, "Math.max(yTickValues)", Math.max(yTickValues), d, Math.log10(d) % 1 === 0, d == Math.max(yTickValues), (Math.log10(d) % 1 === 0) || (d == Math.max(yTickValues)))
                            (Math.log10(d) % 1 === 0) || (d == Math.max(...yTickValues)) ? humanFormatNumber(d) : ""
                        )
                        .tickSizeOuter(0)
                );
        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });

    // ---------------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------------

    function topRatedBooksFunc(data_choice) {
        Promise.all([
            d3.json("/assets/book-analysis-1/data/top_rated_books.json"),
            d3.json("/assets/book-analysis-1/data/top_5_star_perc.json")
        ]).then(function ([data_1, data_2]) {
            let Cdata = data_choice == 1 ? data_1 : data_2;
            const data = Cdata.filter((d) => d.type == bookTypeFilter);
            const data_field = data_choice == 1 ? 'weighted_rating_s' : '5_star_percent';

            const width = 1200;
            const height = 800;
            const margin = deviceType != "mobile" ? { top: 20, right: 30, bottom: 40, left: 100 } : { top: 20, right: 30, bottom: 80, left: 100 };


            const circleFill = "#ECECEC00";
            const highlightFill = "#FF590C";
            const strokeColor = "#000000";
            const strokeWidth = 1;
            const imgWidth = 39.2;
            const imgHeight = 60.8;
            const radius = Math.sqrt(
                Math.pow(imgHeight / 2, 2) + Math.pow(imgWidth / 2, 2)
            );
            const highlightRadius = radius * 1.5;
            const imgMultiple = 1.3;
            const highlightStrokeWidth = 7;

            const svg = d3
                .select("#top-rated-books-chart")
                .selectAll("svg")
                .data([true])
                .join("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr(
                    "style",
                    "max-width: 100%; height: auto; height: intrinsic;"
                );

            const defs = svg.selectAll("defs")
                .data([true])
                .join(
                    enter => enter
                        .append("defs")
                        .append("marker")
                        .attr("id", "arrowhead-right")
                        .attr("refX", 0)
                        .attr("refY", 5)
                        .attr("markerWidth", 16)
                        .attr("markerHeight", 13)
                        .append("path")
                        .attr("d", "M 0 0 L 5 5 L 0 10")
                        .attr("stroke", "black")
                        .attr("stroke-width", 1)
                        .attr("fill", "#000000"),
                    update => update,
                );

            const svg_g = svg
                .selectAll("g.svg_g")
                .data([true])
                .join("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`)
                .attr("class", "svg_g");

            const xMin = d3.min(data, (d) => d[data_field]);
            const xMax = d3.max(data, (d) => d[data_field]);
            const xScale = d3
                .scaleLinear()
                .domain([xMin - (data_choice == 1 ? 10 : 0.01), xMax + (data_choice == 1 ? 10 : 0.01)])
                .range([0, width - margin.left - margin.right]);
            const tickFrmt = (data_choice == 1 ? (d) => (d > 100 ? '' : d) : ((d) => (d * 100) + '%'));
            const xAxis = d3.axisBottom(xScale).ticks(5).tickSizeOuter(0).tickFormat(tickFrmt);

            svg_g
                .selectAll("g.axis.axis--x")
                .data([true])
                .join("g")
                .classed("axis axis--x", true)
                .attr(
                    "transform",
                    `translate(0, ${height - margin.top - margin.bottom})`
                )
                .call((g) =>
                    g
                        .selectAll("text.axis-title")
                        .data([true])
                        .join("text")
                        .attr("class", "axis-title")
                        .attr("x", width - margin.right - margin.left)
                        .attr("y", margin['bottom'] - 4)
                        .attr("fill", "currentColor")
                        .attr("text-anchor", "end")
                        .text(data_choice == 1 ? "Weighted Rating →" : "Percentage of 5-star ratings →")
                )
                .call(xAxis);

            d3.select("#top-rated-books-chart .axis.axis--x path.domain")
                .attr("marker-end", "url(#arrowhead-right)");
            // d3.select("#top-rated-books-chart .axis.axis--x").selectAll("line").attr("stroke", "#000000");
            // d3.select("#top-rated-books-chart .axis.axis--x").selectAll("path").attr("stroke", "#f00").attr("stroke-width", 3);

            // svg_g
            //     .selectAll("g.circles")
            //     .data([true])
            //     .join("g")
            //     .classed("circles", true);

            const simulation = d3
                .forceSimulation(data)
                .force("x", d3.forceX((d) => xScale(d[data_field])).strength(1))
                .force("y", d3.forceY((height - margin.top - margin.bottom) / 2).strength(bookTypeFilter == "non-fiction" ? 0.5 : 0.1))
                // .force("charge", d3.forceManyBody().strength(1))
                .force("collide", d3.forceCollide(radius))
                .stop();

            for (let i = 0; i < 300; ++i) {
                simulation.tick();
            }

            // create an empty selection from data binding
            const circlesCon = svg_g
                .selectAll("g.circles")
                .data([true])
                .join("g")
                .classed("circles", true);

            const circles = circlesCon
                .selectAll("g.node")
                .data(simulation.nodes(), (d) => d.id)
                .join(
                    enter => enter
                        .append("g")
                        .attr("class", "node")
                        .attr("transform", (d) => `translate(0,0)`)
                        .transition().duration(3000)
                        .attr("transform", (d) => `translate(${d.x}, ${d.y})`),
                    update => update
                        // .attr("transform", (d) => `translate(0,0)`)
                        .transition().duration(3000)
                        .attr("transform", (d) => `translate(${d.x}, ${d.y})`),
                    exit => exit
                        .transition().duration(3000)
                        .style("opacity", 0)
                        .remove()
                );


            const tooltip = d3
                .select("body")
                .selectAll("div.beeswarm-tooltip")
                .data([true])
                .join("div")
                .attr("class", "beeswarm-tooltip")
                .style("opacity", 0);

            let showTooltipFunc = function (event, d) {
                tooltip.html(
                    `<span class="tt-head">${d.title}</span> <br> 
                    By ${d.author_name} <br> 
                    ${data_choice == 1 ? "Weighted Rating" : "Percentage of 5-star ratings"}: 
                    <span class="tt-stat">${data_choice == 1 ? d[data_field].toFixed(3) : d3.format(".1%")(d[data_field])}</span>`
                );
                tooltip
                    .transition()
                    .duration(200)
                    .ease(d3.easePoly.exponent(1))
                    .style("opacity", 1)
                    .style(
                        "left",
                        (deviceType == "desktop" ? event.pageX : 80) + "px"
                    )
                    .style("top", event.pageY - 28 + "px");
            };

            let hideTooltipFunc = function (event, d) {
                tooltip.transition().duration(100).style("opacity", 0);
            };

            // Iterate through each node
            circles.each(function (d) {
                const currentNode = d3.select(this);
                const headshot = d.image_url;

                // //create circle
                // currentNode
                //     .selectAll("circle")
                //     .data([true])
                //     .join("circle")
                //     .attr("r", radius)
                //     .attr("fill", circleFill)
                //     .attr("stroke-width", strokeWidth)
                //     .attr("stroke", "#00000000");

                if (deviceType != "mobile") {
                    currentNode
                        .selectAll("a")
                        .data([true])
                        .join("a")
                        .attr(
                            "href",
                            () => "https://www.goodreads.com/book/show/" + d.id
                        )
                        .attr("target", "_blank")
                        .selectAll("image")
                        .data([true])
                        .join("image")
                        .attr("class", "headshot")
                        .attr("width", imgWidth)
                        .attr("height", imgHeight)
                        .attr("href", headshot)
                        .attr("x", -imgWidth / 2) // Adjust the image position to center it
                        .attr("y", -imgHeight / 2)
                        .attr("preserveAspectRatio", "xMidYMid slice"); // Maintain aspect ratio and fill the circle
                } else {
                    currentNode
                        .selectAll("g")
                        .data([true])
                        .join("g")
                        .selectAll("image")
                        .data([true])
                        .join("image")
                        .attr("class", "headshot")
                        .attr("width", imgWidth)
                        .attr("height", imgHeight)
                        .attr("href", headshot)
                        .attr("x", -imgWidth / 2) // Adjust the image position to center it
                        .attr("y", -imgHeight / 2)
                        .attr("preserveAspectRatio", "xMidYMid slice"); // Maintain aspect ratio and fill the circle
                }

                currentNode
                    .selectAll("rect")
                    .data([true])
                    .join("rect")
                    .attr("class", "img-border")
                    .attr("width", imgWidth + strokeWidth)
                    .attr("height", imgHeight + strokeWidth)
                    .attr("x", -(imgWidth + strokeWidth) / 2) // Adjust the image position to center it
                    .attr("y", -(imgHeight + strokeWidth) / 2)
                    .attr("preserveAspectRatio", "xMidYMid slice")
                    .attr("fill", "none")
                    .attr("stroke", strokeColor)
                    .attr("stroke-width", strokeWidth);

                currentNode
                    .style("cursor", "pointer") // Set the cursor to pointer for the entire group
                    .on("mouseover", (event, d) => {
                        // Increase the radius of the circle to 1.5 times on mouseover
                        // d3.select(this)
                        //     .select("circle")
                        //     .transition()
                        //     .duration(200)
                        //     .attr("r", highlightRadius)
                        //     .attr(
                        //         "stroke-width",
                        //         highlightRadius * strokeMultiple
                        //     )
                        //     .attr("fill", highlightFill);

                        circles
                            .filter((x) => x.id !== d.id)
                            .select("image")
                            .attr("filter", "grayscale(0.9)");

                        d3.select(this)
                            .select("image")
                            .transition()
                            .duration(200)
                            .attr("height", imgHeight * imgMultiple)
                            .attr("width", imgWidth * imgMultiple)
                            // .call(d => console.log("🔵 IMAGE", d, imgHeight * imgMultiple, imgWidth * imgMultiple, (-imgWidth * imgMultiple) / 2))
                            .attr("x", (-imgWidth * imgMultiple) / 2) // Adjust the image position to center it
                            .attr("y", (-imgHeight * imgMultiple) / 2); // Maintain aspect ratio and fill the circle

                        d3.select(this)
                            .raise()
                            .select("rect")
                            .transition()
                            .duration(200)
                            .attr("stroke-width", highlightStrokeWidth)
                            .attr("stroke", highlightFill)
                            .attr("height", imgHeight * imgMultiple + highlightStrokeWidth)
                            .attr("width", imgWidth * imgMultiple + highlightStrokeWidth)
                            .attr("x", -(imgWidth * imgMultiple + highlightStrokeWidth) / 2)
                            .attr("y", -(imgHeight * imgMultiple + highlightStrokeWidth) / 2);
                        //raise circle and text element on hover
                        // d3.select(event.currentTarget).raise();

                        //make tooltip visible, use custom function to return info about player
                        showTooltipFunc(event, d);
                    })
                    .on("mouseout", function () {
                        // Return to the regular size on mouseout
                        //   mutable hoveredPlayer = null;

                        // d3.select(this)
                        //     .select("circle")
                        //     .transition()
                        //     .duration(200)
                        //     .attr("r", radius)
                        //     .attr("stroke-width", radius * strokeMultiple)
                        //     .attr("fill", circleFill);

                        circles
                            .filter((x) => x.id !== d.id)
                            .select("image")
                            .attr("filter", "grayscale(0)");

                        d3.select(this)
                            .select("image")
                            .transition()
                            .duration(200)
                            .attr("height", imgHeight)
                            .attr("width", imgWidth)
                            .attr("x", -imgWidth / 2) // Adjust the image position to center it
                            .attr("y", -imgHeight / 2); // Maintain aspect ratio and fill the circle

                        d3.select(this)
                            .select("rect")
                            .transition()
                            .duration(200)
                            .attr("stroke-width", strokeWidth)
                            .attr("stroke", strokeColor)
                            .attr("height", imgHeight)
                            .attr("width", imgWidth)
                            .attr("x", -imgWidth / 2)
                            .attr("y", -imgHeight / 2);

                        //hide tooltip after hovering
                        hideTooltipFunc(event, d);
                    })
                    .on("mousemove", (event) => {
                        tooltip
                            .style("top", event.pageY - 50 + "px")
                            .style("left", event.pageX + 10 + "px");
                    });
            });
        })
            .catch(function (error) {
                console.error("Error loading the CSV file:", error);
            });
    }

    $('.top-rated-filter').on('click', function (event) {
        const topType = $(event.target).data('filter');
        if (topType == 'weighted') {
            $('.top-rated-filter').removeClass('active');
            $(event.target).addClass('active');
            topRatedBooksFunc(1);
        } else {
            $('.top-rated-filter').removeClass('active');
            $(event.target).addClass('active');
            topRatedBooksFunc(2);
        }
    });

    // get the active button
    const topType = $('.top-rated-filter.active').data('filter');
    topType == 'weighted' ? topRatedBooksFunc(1) : topRatedBooksFunc(2);
    // chartFuncs["top-rated-books-chart"] = topRatedBooksFunc;
    // observer.observe(document.getElementById("top-rated-books-chart"));




    Promise.all([
        d3.json("/assets/book-analysis-1/data/top_authors.json"),
        d3.json("/assets/book-analysis-1/data/top_author_works.json")
    ]).then(function ([top_authors, top_author_works]) {
        top_authors = top_authors.filter((d) => d.type == bookTypeFilter);
        top_author_works = top_author_works.filter((d) => d.type == bookTypeFilter);
        createBarChart_2(top_authors, top_author_works, "top-authors-chart", "count", "author_name", ["Authored", "books", "Author's most popular books"]);
    })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });



    Promise.all([
        d3.json("/assets/book-analysis-1/data/most_rated_authors.json"),
        d3.json("/assets/book-analysis-1/data/most_rated_author_works.json")
    ]).then(function ([most_rated_authors, most_rated_author_works]) {
        most_rated_authors = most_rated_authors.filter((d) => d.type == bookTypeFilter);
        most_rated_author_works = most_rated_author_works.filter((d) => d.type == bookTypeFilter);
        createBarChart_2(most_rated_authors, most_rated_author_works, "most-rated-authors-chart", "ratings_count", "author_name", ["Received", "ratings", "Author's most popular books"]);
    })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });


    Promise.all([
        d3.json("/assets/book-analysis-1/data/top_rated_authors.json"),
        d3.json("/assets/book-analysis-1/data/top_rated_author_works.json")
    ]).then(function ([top_authors, top_author_works]) {
        top_authors = top_authors.filter((d) => d.type == bookTypeFilter);
        top_author_works = top_author_works.filter((d) => d.type == bookTypeFilter);
        // createBarChart_2(top_authors, top_author_works, "top-rated-authors-chart", "average_rating", "author_name");

        data1 = top_authors;
        data2 = top_author_works;
        metric = "average_rating";
        categoryField = "author_name";
        chartId = "top-rated-authors-chart";


        // remove "type" field from data
        data1 = data1.map((d) => {
            delete d.type;
            return d;
        });

        tbl = table(data1, {
            sortable: false,
            paged: false,
            style: "normal",
            columns: {
                author_name: {
                    type: "string",
                    formatter: (d, rowIndex, row) => `<span class="pt-author">${d}</span>`,
                    title: "Author",
                },
                average_rating: {
                    type: "number",
                    formatter: (d, rowIndex, row) => `<span class="rstar material-symbols-outlined">star</span>${d3.format(".2f")(d)}`,
                    title: "Author Rating",
                },
            },
        });

        const tooltip = d3
            .select("body")
            .selectAll('div.author-top-works-tooltip-2')
            .data([true])
            .join("div")
            .attr("class", "author-top-works-tooltip-2")
            .style("opacity", 0);

        let showTooltipFunc = function (event) {
            let author_d = data2.filter((d2) => d2[categoryField] == event.target.innerText);
            let author_name = author_d[0][categoryField];
            let avg_rating = author_d[0][metric];
            let top_works = data2.filter((d2) => d2[categoryField] == author_name);
            tooltip.html(
                `
                    <strong>${author_name}</strong> <br>
                    Author's average book rating: ${d3.format(",")(avg_rating)} <br>
                    <hr>
                    <strong class="tt-works-title">Author's most popular books</strong> <br>
                    <div class="tt-works">
                    ${top_works.map(d => `<div class='a-top-work'>
                                                <div><img src=${d.image_url} /></div> 
                                                <div>
                                                    <p class="tt-bk-title">${d.title}</p>
                                                    <p><span class="rstar material-symbols-outlined">star</span>${d3.format(".2f")(d.average_rating)} 
                                                    (${humanFormatNumber(d.ratings_count)} ratings)</p>
                                                </div>
                                            </div>`).join(" ")
                }
                    </div>
                    `
            );
            tooltip
                .transition()
                .duration(200)
                .ease(d3.easePoly.exponent(1))
                .style("opacity", 1)
                .style(
                    "left",
                    (deviceType == "desktop" ? event.pageX : 80) + "px"
                )
                .style("top", event.pageY - 28 + "px");
        };

        let hideTooltipFunc = function () {
            tooltip.transition().duration(100).style("opacity", 0);
        };

        d3.select("#" + chartId).node().replaceChildren();
        d3.select("#" + chartId).node().appendChild(tbl);

        d3.selectAll(`#${chartId} .pt-author`).on("mouseover", showTooltipFunc);
        d3.selectAll(`#${chartId} .pt-author`).on("mouseout", hideTooltipFunc);
    })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });







    Promise.all([
        d3.json("/assets/book-analysis-1/data/top_publishers.json"),
        d3.json("/assets/book-analysis-1/data/top_publisher_works.json")
    ]).then(function ([top_publishers, top_publisher_works]) {
        top_publishers = top_publishers.filter((d) => d.type == bookTypeFilter);
        top_publisher_works = top_publisher_works.filter((d) => d.type == bookTypeFilter);
        createBarChart_2(top_publishers, top_publisher_works, "top-publishers-chart", "count", "publisher", ["Published", "books", "Publisher's most popular books"]);
    })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });



    Promise.all([
        d3.json("/assets/book-analysis-1/data/most_rated_publishers.json"),
        d3.json("/assets/book-analysis-1/data/most_rated_publisher_works.json")
    ]).then(function ([most_rated_publishers, most_rated_publisher_works]) {
        most_rated_publishers = most_rated_publishers.filter((d) => d.type == bookTypeFilter);
        most_rated_publisher_works = most_rated_publisher_works.filter((d) => d.type == bookTypeFilter);
        createBarChart_2(most_rated_publishers, most_rated_publisher_works, "most-rated-publishers-chart", "ratings_count", "publisher", ["Received", "ratings", "Publisher's most popular books"]);
    })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });



    Promise.all([
        d3.json("/assets/book-analysis-1/data/top_rated_publishers.json"),
        d3.json("/assets/book-analysis-1/data/top_rated_publisher_works.json")
    ]).then(function ([top_publishers, top_publisher_works]) {
        top_publishers = top_publishers.filter((d) => d.type == bookTypeFilter);
        top_publisher_works = top_publisher_works.filter((d) => d.type == bookTypeFilter);
        // createBarChart_2(top_publishers, top_publisher_works, "top-rated-publishers-chart", "average_rating", "publisher_name");

        const data1 = top_publishers.map((d) => {
            delete d.type;
            return d;
        });
        const data2 = top_publisher_works;
        const metric = "average_rating";
        const categoryField = "publisher";
        const chartId = "top-rated-publishers-chart";


        tbl = table(data1, {
            sortable: false,
            paged: false,
            style: "normal",
            columns: {
                publisher: {
                    type: "string",
                    formatter: (d, rowIndex, row) => `<span class="pt-publisher">${d}</span>`,
                    title: "Publisher",
                },
                average_rating: {
                    type: "number",
                    formatter: (d, rowIndex, row) => `<span class="rstar material-symbols-outlined">star</span>${d3.format(".2f")(d)}`,
                    title: "Publisher Rating",
                },
            },
        });

        const tooltip = d3
            .select("body")
            .selectAll("div.publisher-top-works-tooltip-2")
            .data([true])
            .join("div")
            .attr("class", "publisher-top-works-tooltip-2")
            .style("opacity", 0);

        let showTooltipFunc = function (event) {

            let publisher_d = data2.filter((d2) => d2[categoryField] == event.target.innerText);
            let publisher_name = publisher_d[0][categoryField];
            let avg_rating = publisher_d[0][metric];
            let top_works = data2.filter((d2) => d2[categoryField] == publisher_name);
            tooltip.html(
                `
                    <strong>${publisher_name}</strong> <br>
                    Publisher's average book rating: ${d3.format(",")(avg_rating)} <br>
                    <hr>
                    <strong class="tt-works-title">Publisher's most popular books</strong> <br>
                    <div class="tt-works">
                    ${top_works.map(d => `<div class='a-top-work'>
                                                <div><img src=${d.image_url} /></div> 
                                                <div>
                                                    <p class="tt-bk-title">${d.title}</p>
                                                    <p><span class="rstar material-symbols-outlined">star</span>${d3.format(".2f")(d.average_rating)} 
                                                    (${humanFormatNumber(d.ratings_count)} ratings)</p>
                                                </div>
                                            </div>`).join(" ")
                }
                    </div>
                    `
            );
            tooltip
                .transition()
                .duration(200)
                .ease(d3.easePoly.exponent(1))
                .style("opacity", 1)
                .style(
                    "left",
                    (deviceType == "desktop" ? event.pageX : 80) + "px"
                )
                .style("top", event.pageY - 28 + "px");
        };

        let hideTooltipFunc = function () {
            tooltip.transition().duration(100).style("opacity", 0);
        };

        d3.select("#" + chartId).node().replaceChildren();
        d3.select("#" + chartId).node().appendChild(tbl);

        d3.selectAll(`#${chartId} .pt-publisher`).on("mouseover", showTooltipFunc);
        d3.selectAll(`#${chartId} .pt-publisher`).on("mouseout", hideTooltipFunc);
    })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });








    Promise.all([
        d3.json("/assets/book-analysis-1/data/series_book_perc.json"),
        d3.json("/assets/book-analysis-1/data/top_series.json"),
        d3.json("/assets/book-analysis-1/data/top_series_works.json")
    ]).then(function ([series_book_perc, top_series, top_series_works]) {
        series_book_perc = series_book_perc[bookTypeFilter];
        top_series = top_series.filter((d) => d.type == bookTypeFilter);
        top_series_works = top_series_works.filter((d) => d.type == bookTypeFilter);

        d3.select("#books_count_2").html(d3.format(",")(series_book_perc[0]));
        d3.select("#perc_books_in_series").html(d3.format(".2%")(series_book_perc[1]));


        const chart = d3.select("#longest-series-chart")
            .selectAll("div.longest-series-chart")
            .data([true])
            .join("div")
            .attr("class", "longest-series-chart");

        const series = chart
            .selectAll("div.series")
            .data(top_series)
            .join("div")
            .attr("class", "series");

        const series_names = series
            .selectAll("div.series-name")
            .data(d => [d])
            .join("div")
            .attr("class", "series-name")
            .selectAll("span")
            .data(d => [d])
            .join("span")
            .html(d => d.series_name);

        const seriesBooks = series
            .selectAll("div.series-books")
            .data(d => [d])
            .join("div")
            .attr("class", "series-books")
            .selectAll("div.series-book")
            .data(d => d3.range(1, d.count + 1))
            .join("div")
            .attr("class", "series-book");


        const tooltip = d3
            .select("body")
            .selectAll("div.series-top-works-tooltip")
            .data([true])
            .join("div")
            .attr("class", "series-top-works-tooltip")
            .style("opacity", 0);

        let showTooltipFunc = function (event, d) {
            let top_works = top_series_works.filter((d2) => d2['series_id'] == d['series_id']);
            tooltip.html(
                `
                    <strong>${d['series_name']}</strong> <br>
                    Includes ${d3.format(",")(d['count'])} books <br>
                    <hr>
                    <strong class="tt-works-title">Series' most popular books</strong> <br>
                    <div class="tt-works">
                    ${top_works.map(d => `<div class='a-top-work'>
                                                <div><img src=${d.image_url} /></div> 
                                                <div>
                                                    <p class="tt-bk-title">${d.title}</p>
                                                    <p><span class="rstar material-symbols-outlined">star</span>${d3.format(".2f")(d.average_rating)} 
                                                    (${humanFormatNumber(d.ratings_count)} ratings)</p>
                                                </div>
                                            </div>`).join(" ")
                }
                    </div>
                    `
            );
            tooltip
                .transition()
                .duration(200)
                .ease(d3.easePoly.exponent(1))
                .style("opacity", 1)
                .style(
                    "left",
                    (deviceType == "desktop" ? event.pageX : 80) + "px"
                )
                .style("top", event.pageY - 28 + "px");
        };

        let hideTooltipFunc = function (event, d) {
            tooltip.transition().duration(100).style("opacity", 0);
        };
        series_names.on("mouseover", showTooltipFunc);
        series_names.on("mouseout", hideTooltipFunc);

    })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });










    Promise.all([
        d3.json("/assets/book-analysis-1/data/most_rated_series.json"),
        d3.json("/assets/book-analysis-1/data/most_rated_series_works.json")
    ]).then(function ([top_series, top_series_works]) {
        top_series = top_series.filter((d) => d.type == bookTypeFilter);
        top_series_works = top_series_works.filter((d) => d.type == bookTypeFilter);

        createBarChart_2(top_series, top_series_works, "most-rated-series-chart", "ratings_count", "series_name", ["Received", "ratings", "Series' most popular books"]);
    })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });







    d3.json("/assets/book-analysis-1/data/num_pages_hists.json")
        .then(function (data) {
            data = data[bookTypeFilter];
            const inset = 1;
            const marginTop = 40; // top margin, in pixels
            const marginRight = 20; // right margin, in pixels
            const marginBottom = 45; // bottom margin, in pixels
            const marginLeft = 40; // left margin, in pixels
            const width = 800; // outer width of chart, in pixels
            const height = 500; // outer height of chart, in pixels

            const xScale = d3.scaleLinear(
                [0, d3.max(data.map((d) => d.x1))],
                [marginLeft, width - marginRight]
            );
            const yScale = d3
                .scaleSymlog(
                    [0, d3.max(data.map((d) => d.freq))],
                    [height - marginBottom, marginTop]
                )
                .constant(1)
                .clamp(true)
                .nice();

            const svg = d3
                .select("#num-pages-hist-chart")
                .selectAll("svg")
                .data([true])
                .join("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr(
                    "style",
                    "max-width: 100%; height: auto; height: intrinsic;"
                );

            // svg.append("linearGradient")
            //     .attr("id", "area-gradient")
            //     .attr("gradientUnits", "userSpaceOnUse")
            //     .attr("x1", "100%")
            //     .attr("y1", "0%")
            //     .attr("x2", "0%")
            //     .attr("y2", "0%")
            //     .selectAll("stop")
            //     .data([
            //         { offset: "0%", color: "navy" },
            //         // add additional steps as needed for gradient.
            //         { offset: "95%", color: "transparent" },
            //     ])
            //     .enter()
            //     .append("stop")
            //     .attr("offset", function (d) {
            //         return d.offset;
            //     })
            //     .attr("stop-color", function (d) {
            //         return d.color;
            //     });

            const g = svg
                .selectAll("g.histogram")
                .data([true])
                .join("g")
                .attr("class", "histogram");

            let rects = g
                // .attr("fill", "url(#area-gradient)")
                .attr("fill", "steelblue")
                .selectAll("rect")
                .data(data)
                .join("rect")
                .attr("class", "bar")
                // .attr("fill", "linear-gradient(180deg, #fff, #ddd)")
                .attr("x", (d) => xScale(d.x0) + inset)
                .attr("width", (d) =>
                    Math.max(0, xScale(d.x1) - xScale(d.x0) - inset)
                )
                .attr("y", (d, i) => yScale(d.freq))
                .attr("height", (d, i) => yScale(0) - yScale(d.freq));

            let histTooltip = d3
                .select("body")
                .append("div")
                .attr("class", "num-pages-hist-tooltip")
                .style("opacity", 0);

            let showTooltipFunc = function (event, d) {
                histTooltip.html(
                    `<strong>${d3.format(",")(d.freq)}</strong> books have a number of pages between <strong>${humanFormatNumber(d.x0, 2)}</strong> and <strong>${humanFormatNumber(d.x1, 2)}</strong>`
                );
                histTooltip
                    .transition()
                    .duration(200)
                    .ease(d3.easePoly.exponent(1))
                    .style("opacity", 1)
                    .style(
                        "left",
                        (deviceType == "desktop" ? event.pageX : 80) + "px"
                    )
                    .style("top", event.pageY - 28 + "px");
            };

            let hideTooltipFunc = function (event, d) {
                histTooltip.transition().duration(100).style("opacity", 0);
            };

            rects
                .on("mouseover", showTooltipFunc)
                .on("touchstart", showTooltipFunc)
                .on("mouseout", hideTooltipFunc)
                .on("touchend", hideTooltipFunc);

            let xAxg = g
                .selectAll("g.x-axis")
                .data([true])
                .join("g")
                .attr("class", "x-axis");

            xAxg
                .attr("transform", `translate(0,${height - marginBottom})`)
                .call((g) =>
                    g
                        .append("text")
                        .attr("x", width)
                        .attr("y", marginBottom - 4)
                        .attr("fill", "currentColor")
                        .attr("text-anchor", "end")
                        .text("Number of Pages →")
                )
                .transition()
                .duration(750)
                .call(
                    d3
                        .axisBottom(xScale)
                        .ticks(10)
                        .tickFormat((d) => humanFormatNumber(d))
                        .tickSizeOuter(0)
                );


            let yAxg = g
                .selectAll("g.y-axis")
                .data([true])
                .join("g")
                .attr("class", "y-axis");

            const yTickValues = generateLogScaleArray(yScale.domain()[1]);

            // Add the y-axis and label, and remove the domain line.
            yAxg
                .attr("transform", `translate(${marginLeft},0)`)
                .call((g) => g.select(".domain").remove())
                .call((g) =>
                    g
                        .append("text")
                        .attr("x", -marginLeft)
                        .attr("y", 10)
                        .attr("fill", "currentColor")
                        .attr("text-anchor", "start")
                        .text("↑ Frequency (no. of books)")
                )
                .transition()
                .duration(750)
                .call(
                    d3
                        .axisLeft(yScale)
                        // .ticks(-10)
                        .tickValues(yTickValues)
                        // .tickValues()
                        .tickFormat((d) =>
                            // console.log("yTickValues", yTickValues, "Math.max(yTickValues)", Math.max(yTickValues), d, Math.log10(d) % 1 === 0, d == Math.max(yTickValues), (Math.log10(d) % 1 === 0) || (d == Math.max(yTickValues)))
                            (Math.log10(d) % 1 === 0) || (d == Math.max(...yTickValues)) ? humanFormatNumber(d) : ""
                        )
                        .tickSizeOuter(0)
                );
        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });


















    // d3.json("/assets/book-analysis-1/data/long_books_high_ratings.json")
    // .then(function (data) {
    //     data = data.filter((d) => d.type == bookTypeFilter);

    //     const data1 = data.map((d) => {
    //         delete d.type;
    //         delete d.id;
    //         delete d.author_name;
    //         return d;
    //     });
    //     const chartId = "long-high-rating-chart";


    //     tbl = table(data1, {
    //         sortable: false,
    //         paged: false,
    //         style: "normal",
    //         columns: {
    //             image_url: {
    //                 type: "string",
    //                 formatter: (d, rowIndex, row) => `<img class="pt-cover" src="${d}">`,
    //                 title: "Cover"
    //             },
    //             title: {
    //                 type: "string"
    //             },
    //             num_pages: {
    //                 type: "number",
    //                 formatter: (d, rowIndex, row) => d3.format(",")(d),
    //                 title: "Number of pages"
    //             },
    //             average_rating: {
    //                 type: "number",
    //                 formatter: (d, rowIndex, row) => `<span class="rstar material-symbols-outlined">star</span>${d3.format(".2f")(d)}`,
    //                 title: "Average rating"
    //             },
    //             ratings_count: {
    //                 type: "number",
    //                 formatter: (d, rowIndex, row) => d3.format(",")(d),
    //                 title: "Number of ratings"
    //             }
    //         }
    //     });

    //     d3.select("#" + chartId).node().replaceChildren();
    //     d3.select("#" + chartId).node().appendChild(tbl);

    // })
    // .catch(function (error) {
    //     console.error("Error loading the CSV file:", error);
    // });



    d3.json("/assets/book-analysis-1/data/shelf_ts.json")
        .then(function (data) {
            ['romance', 'fantasy', 'mystery', 'history', 'contemporary', 'young-adult', 'science-fiction', 'biography', 'poetry', 'philosophy']
            if (bookTypeFilter == "fiction") {
                data = data.filter((d) => ['romance', 'fantasy', 'mystery', 'contemporary', 'young-adult', 'science-fiction'].includes(d.shelf));
            } else if (bookTypeFilter == "non-fiction") {
                data = data.filter((d) => ["history", "poetry", "philosophy"].includes(d.shelf));
            }

            const parseDate = d3.timeParse("%Y-%m-%d");
            data = data.map((d) => {
                d.pub_date = parseDate(d.pub_date);
                return d;
            });

            data = data.map(obj => {
                obj['Genre'] = obj.shelf;
                delete obj.shelf;
                obj['Number of Books'] = obj.count;
                delete obj.count;
                obj['Publication Year'] = obj.pub_date;
                delete obj.pub_date;
                return obj;
            });

            const plotShelfTS = (data) => {
                document.getElementById("pl").innerHTML = "";

                const p = Plot.plot({
                    style: "overflow: visible;",
                    marginTop: 35,
                    marginBottom: 45,
                    marginLeft: deviceType != "mobile" ? 0 : 80,
                    marginRight: deviceType != "mobile" ? 0 : 80,
                    y: { grid: true },
                    color: {
                        type: "categorical",
                        // scheme: "category10",
                    },
                    marks: [
                        Plot.ruleY([0]),
                        Plot.lineY(data, {
                            x: "Publication Year", y: "Number of Books", stroke: "Genre", ariaLabel: "Genre",
                            strokeWidth: 2,
                            tip: { format: { stroke: true, x: (d) => d.getFullYear(), y: (d) => d3.format(",")(d) }, lineHeight: 1.5 }
                        }),
                        Plot.text(data, Plot.selectLast({ x: "Publication Year", y: "Number of Books", z: "Genre", text: "Genre", textAnchor: "start", dx: 3 })),
                        // Plot.tip(data, Plot.pointerX({x: "Publication Year", y: "Number of Books"}))
                    ]
                });

                p.setAttribute("font-size", "0.8rem");

                document.getElementById("pl").appendChild(p);
            };

            plotShelfTS(data);

            // create a group of radio button filters to choose shelves
            d3.select("#shelf-filters").node().replaceChildren();
            const shelfFilters = d3
                .select("#shelf-filters")
                .selectAll("div.shelf-radio")
                .data([...new Set(data.map(obj => obj['Genre']))])
                .join("div")
                .attr("class", "shelf-filter");

            shelfFilters
                .selectAll("input")
                .data(d => [d])
                .join("input")
                .attr("type", "checkbox")
                .attr("name", "shelf")
                .attr("value", (d) => d)
                .attr("id", (d) => "shelf-" + d)
                .property("checked", true)
                .on("change", (event) => {
                    let checkedShelves = Array.from(document.querySelectorAll('input[name=shelf]:checked')).map(cb => cb.value);
                    let filteredData = data.filter((d) => checkedShelves.includes(d['Genre']));
                    plotShelfTS(filteredData);
                }
                );

            shelfFilters
                .selectAll("label")
                .data(d => [d])
                .join("label")
                .attr("for", (d) => "shelf-" + d)
                .text((d) => d);

            // d3.select("#pl").selectAll("path").each(function(d, i) {
            //     // coordinates
            //     // console.log(this);
            //     d3.select(this).on("mouseover", function(event, d) {
            //         console.log("d", d);
            //         console.log("event", event);
            //     });
            //     d3.select(this).attr("aria-label", "shelf " + d.shelf);
            // });

        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });






    // xx make sure no extra tooltips are added every time the data is updated 
    var tooltip_div = d3.select("body").append("div")
        .attr("class", "wc-tooltip")
        .style("opacity", 0);

    var wcloud_first = true;

    function WordCloud(word_freq, {
        chartId,
        size = group => group.length, // Given a grouping of words, returns the size factor for that word
        word = d => d, // Given an item of the data array, returns the word
        marginTop = 0, // top margin, in pixels
        marginRight = 0, // right margin, in pixels
        marginBottom = 0, // bottom margin, in pixels
        marginLeft = 0, // left margin, in pixels
        width = 640, // outer width, in pixels
        height = 400, // outer height, in pixels
        maxWords = 250, // maximum number of words to extract from the text
        fontFamily = "sans-serif", // font family
        fontScale = 15, // base font size
        fill = null, // text color, can be a constant or a function of the word
        padding = 0, // amount of padding between the words (in pixels)
        rotate = 0, // a constant or function to rotate the words
        // invalidation // when this promise resolves, stop the simulation
    } = {}) {

        // document.getElementById(chartId).innerHTML = "";

        const data = word_freq.slice(0, maxWords);

        // const svg = d3.create("svg")
        //     .attr("viewBox", [0, 0, width, height])
        //     .attr("width", width)
        //     .attr("font-family", fontFamily)
        //     .attr("text-anchor", "middle")
        //     .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        const svg = d3.select("#" + chartId)
            .selectAll("svg")
            .data([true])
            .join("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("font-family", fontFamily)
            .attr("text-anchor", "middle")
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        // const g = svg.append("g").attr("transform", `translate(${marginLeft},${marginTop})`);

        if (d3wc_cloud !== undefined) {
            d3wc_cloud.stop();
            d3wc_cloud = undefined;
        }

        const maxSize = Math.sqrt(d3.max(data, d => d.size)) * fontScale;
        const minSize = Math.sqrt(d3.min(data, d => d.size)) * fontScale;

        function handleMouseOver(event, d) {
            // sentences = data.filter((dt) => dt.text == d3.select(this).text())[0].sentences;
            sentences = d.sentences.map((s) => s.replace(new RegExp(d.text, "gi"), match => `<mark class="wct-mark">${match}</mark>`));
            d3.select(this).classed("word-hovered", true);

            tooltip_div.transition()
                .duration(200)
                .style("opacity", 1)
                .style("left", (deviceType == "desktop" ? event.pageX : 80) + "px")
                .style("top", event.pageY - 28 + "px");
            // make sentences inside divs
            sentences = sentences.map((s) => `<li class="wc-sentence">${s}</li>`);
            tooltip_div.html(`Used <strong>${d.freq} times</strong> in book titles like: <ul>${sentences.join(" ")} </ul>`);
        }

        function handleMouseOut(event, d) {
            d3.select(this)
                .classed("word-hovered", false);

            tooltip_div.transition()
                .duration(500)
                .style("opacity", 0);
        }

        const colorMap = () => {
            const colors = ['#67001f', '#67001f', '#878787', '#1a1a1a', '#d6604d'];
            return colors[Math.floor(Math.random() * colors.length)];
        };

        // const g = svg.append("g").attr("transform", `translate(${marginLeft},${marginTop})`);
        // attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")

        function randomSeed() { return 0.5; }

        d3wc_cloud = d3.layout.cloud()
            .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
            .words(data)
            .padding(padding)
            .rotate(rotate)
            .font(fontFamily)
            .fontSize(d => Math.sqrt(d.size) * fontScale)
            // .random(randomSeed)
            .on("end", drawCloud);

        // .on("word", (word) => {
        //     g.append("text")
        //         .datum(word.text)
        //         .attr("font-size", word.size)
        //         .attr("fill", d3.scaleLinear([minSize, maxSize], ['orange', 'black'])(word.size))
        //         .attr("fill", `${colorMap()}`)
        //         .attr("transform", `translate(${word.x},${word.y}) rotate(${word.rotate})`)
        //         .style('cursor', 'pointer')
        //         .text(word.text)
        //         .on("mouseover", handleMouseOver)
        //         .on("mouseout", handleMouseOut);
        // });

        d3wc_cloud.start();
        // color based on if word existed in previous decades
        function drawCloud(words) {
            const transition1 = svg.transition().duration(750);
            const transition2 = transition1.transition().duration(750);
            const transition3 = transition2.transition().duration(750);
            const g = svg
                .selectAll("g.word-container")
                .data([true])
                .join("g")
                .attr("class", "word-container")
                .attr("transform", "translate(" + d3wc_cloud.size()[0] / 2 + "," + d3wc_cloud.size()[1] / 2 + ")");

            g.selectAll("text")
                .data(words, d => d.text)
                .join(
                    enter => enter.append("text")
                        .attr("font-size", word => word.size)
                        // .attr("fill", d3.scaleLinear([minSize, maxSize], ['orange', 'black'])(word.size))
                        // .attr("fill", word => `${colorMap()}`)
                        .attr("fill", (word) => {
                            if (wcloud_first === true) {
                                return "#000";
                            } else {
                                return "#ff5200";
                            }
                        })
                        // .attr("class", (word) => {
                        //     if (wcloud_first === true) {
                        //         return "wc-old";
                        //     } else {
                        //         return "wc-new";
                        //     }
                        // })
                        .style('cursor', 'pointer')
                        .text(word => word.text)
                        .on("mouseover", handleMouseOver)
                        .on("mouseout", handleMouseOut)
                        .call(enter => enter
                            .attr("fill-opacity", 0)
                            // set random initial position
                            .attr("transform", word => `translate(${word.x},-1000)`)
                            .transition(transition3)
                            .attr("transform", word => `translate(${word.x},${word.y}) rotate(${word.rotate})`)
                            .attr("fill-opacity", 1)
                        ),
                    update => update
                        .attr("fill-opacity", 0.2)
                        // .attr("fill", word => `${colorMap()}`)
                        .attr("fill", "#000")
                        .text(word => word.text)
                        .on("mouseover", handleMouseOver)
                        .on("mouseout", handleMouseOut)
                        .call(update => update
                            // .attr("transform", word => `translate(${word.x},${word.y}) rotate(${word.rotate})`)
                            .transition(transition2).ease(d3.easeCubicInOut)
                            .attr("font-size", word => word.size)
                            .attr("transform", word => `translate(${word.x},${word.y}) rotate(${word.rotate})`)
                            .attr("fill-opacity", 1)),
                    exit => exit
                        .attr("fill-opacity", 1)
                        .call(exit => exit
                            .transition(transition1)
                            .attr("fill-opacity", 0)
                            .attr("transform", word => `translate(${word.x}, 1000)`)
                            .remove()
                        )
                );

            wcloud_first = false;
            // .attr("font-size", word => word.size)
            // // .attr("fill", d3.scaleLinear([minSize, maxSize], ['orange', 'black'])(word.size))
            // .attr("fill", word => `${colorMap()}`)
            // .attr("transform", word => `translate(${word.x},${word.y}) rotate(${word.rotate})`)
            // .style('cursor', 'pointer')
            // .text(word => word.text)
            // .on("mouseover", handleMouseOver)
            // .on("mouseout", handleMouseOut);
        }
        // invalidation && invalidation.then(() => cloud.stop());

        // return svg.node();
        document.getElementById(chartId).innerHTML = "";
        document.getElementById(chartId).appendChild(svg.node());
    };




    d3.json("/assets/book-analysis-1/data/word_freqs.json")
        .then(function (data) {
            // console.log("data before filter", structuredClone(data));
            data = data.filter((d) => d.type == bookTypeFilter);
            // console.log("data after filter", structuredClone(data));
            // const wordCloud = d3.select("#word-cloud-chart").selectAll("div.word-cloud-chart").data([true]).join("div").attr("class", "word-cloud-chart");
            // wordCloud.node().replaceChildren();
            // wordCloud.node().appendChild(wordCloudChart(data, "word-cloud-chart"));


            // create button group to filter word cloud by decade
            const wordCloudDecadeFilters = d3
                .select("#common-words-options")
                .selectAll("div.word-cloud-option")
                .data([...new Set(data.map(obj => obj['period']))])
                .join("div")
                .attr("class", "word-cloud-option")
                .call(dd => {
                    dd.selectAll("input")
                        .data(d => [d])
                        .join("input")
                        .attr("type", "radio")
                        .attr("name", "word-cloud-decade")
                        .attr("value", (d) => d)
                        .attr("id", (d) => "word-cloud-decade-" + d)
                        .attr("class", "word-cloud-radio")
                        // .property("checked", (d) => d == 2020)
                        ;
                })
                .call(dd => {
                    dd.selectAll("label")
                        .data(d => [d])
                        .join("label")
                        .attr("for", (d) => "word-cloud-decade-" + d)
                        .text((d) => d + "s");
                });


            // when a radio button is clicked, filter the word cloud by the selected decade
            d3.selectAll("input.word-cloud-radio").on("change", (event) => {
                let val = event.target.value;
                let filteredData = structuredClone(data.filter((d) => d['period'] == val));

                // reduce "size"
                let max_size = d3.max(filteredData.map((d) => d.size));
                filteredData = filteredData.map((d) => {
                    d.size = d.size / max_size * 100;
                    // d.fill = d.size > 50 ? "black" : "red";
                    return d;
                });

                // console.log("FILTER", val);
                // console.log("filteredData", structuredClone(filteredData));
                // console.log("data xx", structuredClone(data));
                // console.log("word-cloud-chart", document.getElementById("word-cloud-chart").cloneNode(true));
                // document.getElementById("word-cloud-chart").innerHTML = "";
                // console.log("word-cloud-chart", document.getElementById("word-cloud-chart").cloneNode(true));
                // console.log("==============-------------------===============");
                let wc = WordCloud(filteredData, {
                    chartId: "word-cloud-chart",
                    fontFamily: "Source Serif Pro",
                    padding: 3,
                    rotate: 0, //() => ~~(Math.random() * 4) * 45 - 45,
                    width: 1000,
                    height: 600,
                    maxWords: 200,
                    fontScale: 6
                });

                // console.log("wc", wc);
                // document.getElementById("word-cloud-chart").innerHTML = "";
                // document.getElementById("word-cloud-chart").appendChild(wc);
            });


            // initial word cloud.. select the first decade.. trigger the change event
            d3.selectAll("input.word-cloud-radio").filter((d, i) => i == 0).node().click();

            // WordCloud(data.filter((d) => d['period'] == 2020), {
            //     chartId: "word-cloud-chart",
            //     // fill: "black",
            //     fontFamily: "sans-serif",
            //     // fontScale: 15,
            //     padding: 1,
            //     rotate: 0,
            //     width: 640,
            //     height: 400,
            //     maxWords: 250
            // });

        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });






    d3.json("/assets/book-analysis-1/data/avg_pages_over_time.json")
        .then(function (data) {
            data = data.filter((d) => d.type == bookTypeFilter);
            const p = Plot.plot({
                // style: "overflow: visible;",
                marginTop: 35,
                marginBottom: 45,
                y: { grid: true, label: "Median number of pages" },
                x: { label: "Publication decade" },
                marks: [
                    Plot.ruleY([0]),
                    Plot.lineY(data, {
                        x: "original_publication_date", y: "median_num_pages", stroke: "red",
                        curve: "catmull-rom", tip: true, strokeWidth: 2
                    }),
                    Plot.dotY(data, { x: "original_publication_date", y: "median_num_pages", fill: "red", r: 3 }),
                    Plot.axisX({ tickFormat: ".0f" })
                ]
            });

            p.setAttribute("font-size", "0.8rem");

            // console.log("p", p);
            document.getElementById("num-pages-over-time-chart").innerHTML = "";
            document.getElementById("num-pages-over-time-chart").appendChild(p);
        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });









    d3.json("/assets/book-analysis-1/data/avg_ratings_over_time.json")
        .then(function (data) {
            data = data.filter((d) => d.type == bookTypeFilter);
            const p = Plot.plot({
                // style: "overflow: visible;",
                marginTop: 35,
                marginBottom: 45,
                y: { grid: true, label: "Average book rating" },
                x: { label: "Publication decade", tickFormat: ".0f" },
                marks: [
                    Plot.ruleY([0]),
                    Plot.lineY(data, {
                        x: "original_publication_date", y: "average_rating", stroke: "red",
                        curve: "catmull-rom", tip: true, strokeWidth: 2
                    }),
                    // Plot.dotY(data, {x: "original_publication_date", y: "average_rating", fill: "cyan", r: 3}),
                    // Plot.axisX({tickFormat: ".0f"}),
                ]
            });

            p.setAttribute("font-size", "0.8rem");

            // console.log("p", p);
            document.getElementById("avg-rating-over-time-chart").innerHTML = "";
            document.getElementById("avg-rating-over-time-chart").appendChild(p);
        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });










    d3.json("/assets/book-analysis-1/data/top_books_by_year.json")
        .then(function (data) {
            data = data.filter((d) => d.type == bookTypeFilter);
            // convert years (like 1980) to date objects
            data = data.map((d) => {
                d.original_publication_date = d3.utcParse("%Y")(d.original_publication_date);
                return d;
            });

            // Declare the chart dimensions and margins.
            const width = 1000;
            const height = 1000;
            const marginTop = 20;
            const marginRight = 30;
            const marginBottom = 30;
            const marginLeft = 30;
            const infoWidth = deviceType == "mobile" ? 0 : 300;
            const sectionMargin = 20;
            const imageHeight = 40;
            const imageWidth = 26.5;

            // Declare the x (horizontal position) scale.
            // const x = d3.scaleUtc(d3.extent(data, d => d.original_publication_date), [marginLeft, width - marginRight]);
            const x = d3.scalePoint(data.map(d => d.original_publication_date), [marginLeft, width - marginRight])
                .padding(0.5);

            // Create the SVG container.
            const svg = d3.create("svg")
                .attr("width", width + infoWidth)
                .attr("height", height)
                .attr("viewBox", [0, 0, width + infoWidth, height])
                .attr("style", "max-width: 100%; height: auto; height: intrinsic; overflow: visible;");

            // Add the x-axis.
            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height - marginBottom})`)
                .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat(d3.timeFormat("%Y")));

            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${marginTop})`)
                .call(d3.axisTop(x).tickSizeOuter(0).tickFormat(d3.timeFormat("%Y")));


            const chart_height = height - marginTop - marginBottom;

            // // Add the y-axis, remove the domain line, add grid lines and a label.
            // svg.append("g")
            //     .attr("transform", `translate(${marginLeft},0)`)
            //     .call(d3.axisLeft(y).ticks(height / 40))
            //     .call(g => g.select(".domain").remove())
            //     .call(g => g.selectAll(".tick line").clone()
            //         .attr("x2", width - marginLeft - marginRight)
            //         .attr("stroke-opacity", 0.1))
            //     .call(g => g.append("text")
            //         .attr("x", -marginLeft)
            //         .attr("y", 10)
            //         .attr("fill", "currentColor")
            //         .attr("text-anchor", "start")
            //         .text("↑ Daily close ($)"));


            const cursor = svg.append("g")
                .attr("transform", `translate(${marginLeft},0)`)
                .call(g => g
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", marginTop)
                    .attr("width", 1)
                    .attr("height", chart_height)
                    .attr("fill", "#bbb")
                );
            // move with mouse pointer
            svg.on("mousemove", function (event) {
                const [xpos, ypos] = d3.pointer(event);
                // if the pointer within the chart area
                if (xpos >= marginLeft && xpos <= width - marginRight) {
                    cursor.attr("transform", `translate(${xpos},0)`);
                } else {
                    cursor.attr("transform", `translate(${marginLeft},0)`);
                }
                // find the closest date
                // const date = x.invert(xpos - marginLeft);
            });


            const tooltip = d3
                .select("body")
                .append("div")
                .attr("class", "top-over-time-tooltip")
                .style("opacity", 0);

            let showTooltipFunc = function (event, d, rank_type) {
                tooltip.html(
                    `
                    <div class="top-over-time-tt-book">
                        <div class="top-over-time-tt-book-cover">
                            <img src="${d[rank_type][0].image_url}" />
                        </div>
                        <div class="top-over-time-tt-book-details">
                            <p class="tt-tot-title">${d[rank_type][0].title}</p>
                            <p class="tt-tot-author">By ${d[rank_type][0].author_name}</p>
                            <p><span class="rstar material-symbols-outlined">star</span>${d3.format(".2f")(d[rank_type][0].average_rating)}
                                (${humanFormatNumber(d[rank_type][0].ratings_count)} ratings)</p>
                        </div>
                    </div>
                    `
                );
                tooltip
                    .transition()
                    .duration(200)
                    .ease(d3.easePoly.exponent(1))
                    .style("opacity", 1)
                    .style(
                        "left",
                        (deviceType == "desktop" ? event.pageX : 80) + "px"
                    )
                    .style("top", event.pageY - 28 + "px");
            };

            let hideTooltipFunc = function (event, d) {
                tooltip.transition().duration(100).style("opacity", 0);
            };



            // const backgroundColors = ["#272641", "#E4A13A", "#E56348", "#664E43"];
            const backgroundColors = ["#4269d0", "#efb118", "#ff725c", "#6cc5b0"];
            const createLine = (data, rank_type, metric_name, position) => {

                svg.append("g")
                    .append("rect")
                    .attr("x", marginLeft)
                    .attr("y", (position - 1) * chart_height / 4 + sectionMargin)
                    .attr("width", width - marginLeft - marginRight)
                    .attr("height", chart_height / 4 - sectionMargin)
                    .attr("fill", backgroundColors[position - 1])
                    .attr("opacity", 0.1);

                let rank_type_labels = {
                    "most_rated": ["Most Popular Books", "Books with the largest number of ratings."],
                    "top_rated": ["Highest Rated Books", "Books with the highest average rating (out of 5)."],
                    "pop_reg": ["Popular, Yet Not So Loved Books", "Books with a large number of ratings, but their rating falls below the annual average."],
                    "hidden_gem": ["Hidden Gems", "Books with a high average rating, but the number of ratings is below the annual average."]
                }

                function format_rank_type_lable(rank_type) {
                    let [label, description] = rank_type_labels[rank_type];
                    return `<div class="rank-lbl-t">${label}</div><div class="rank-lbl-d">${description}</div>`;
                }

                if (deviceType != "mobile") {
                    svg.append("foreignObject")
                        .attr("x", width)
                        .attr("y", (position - 1) * chart_height / 4 + sectionMargin)
                        .attr("width", infoWidth)
                        .attr("height", chart_height / 4 - sectionMargin)
                        .append("xhtml:div")
                        .style("width", "100%").style("height", "100%")
                        // .style("background", backgroundColors[position - 1] + "33") // 33
                        // .style("opacity", 0.2)
                        // .append("foreignObject")
                        // .append("xhtml:div")
                        .attr("class", "top-over-time-section-label")
                        .html(format_rank_type_lable(rank_type));
                }

                const y = d3.scaleLinear(
                    [d3.min(data, d => d[rank_type][0][metric_name]), d3.max(data, d => d[rank_type][0][metric_name])],
                    [position * chart_height / 4 - sectionMargin / 0.75, (position - 1) * chart_height / 4 + sectionMargin + imageHeight / 0.9]
                );

                const line = d3.line()
                    .x(d => x(d.original_publication_date))
                    .y(d => y(d[rank_type][0][metric_name]));

                svg.append("path")
                    .attr("fill", "none")
                    .attr("stroke", backgroundColors[position - 1])
                    .attr("stroke-width", 2)
                    .attr("d", line(data));

                svg.selectAll(`image.${rank_type}-book-cover`)
                    .data(data)
                    .join("image")
                    .attr("xlink:href", d => d[rank_type][0].image_url)
                    .attr("x", d => x(d.original_publication_date) - imageWidth / 2)
                    .attr("y", d => y(d[rank_type][0][metric_name]) - imageHeight / 2)
                    .attr("width", imageWidth)
                    .attr("height", imageHeight)
                    .attr("class", `image.${rank_type}-book-cover`)
                    .on("mouseover", (event, d) => showTooltipFunc(event, d, rank_type))
                    .on("mouseout", hideTooltipFunc);

                // Add labels 
                svg.selectAll(`text.${rank_type}-book-title`)
                    .data(data)
                    .join("text")
                    .attr("x", d => x(d.original_publication_date))
                    .attr("y", d => y(d[rank_type][0][metric_name]) - imageHeight / 2 - 5)
                    .text(d => humanFormatNumber(d[rank_type][0][metric_name]))
                    .attr("class", `text.${rank_type}-book-title`)
                    // .attr("fill", "#bbb")
                    .attr("font-size", "10px")
                    .attr("text-anchor", "middle");

                // add circles as markers
                // svg.selectAll(`circle.${rank_type}-book-marker`)
                //     .data(data)
                //     .join("circle")
                //     .attr("cx", d => x(d.original_publication_date))
                //     .attr("cy", d => y(d[rank_type][0][metric_name]))
                //     .attr("r", 3)
                //     .attr("fill", "red")
                //     .attr("class", `circle.${rank_type}-book-marker`);
            }

            createLine(data, "most_rated", "ratings_count", 1);
            createLine(data, "top_rated", "average_rating", 2);
            createLine(data, "pop_reg", "ratings_count", 3);
            createLine(data, "hidden_gem", "average_rating", 4);

            document.getElementById("top-books-over-time-chart").innerHTML = "";
            document.getElementById("top-books-over-time-chart").appendChild(svg.node());
        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });


    function getLuminance(rgb) {
        const a = rgb.map(function (v) {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    d3.json("/assets/book-analysis-1/data/common_colors_data.json")
        .then(function (data) {
            data = data.filter((d) => d.type == bookTypeFilter);
            // console.log("data", data);
            // console.log("datssssa", data.filter((d) => d.image_group == "sample"));

            d3.select("#colors-chart").html("");

            const colorChart2 = d3.select("#colors-chart")
                .call(g => g
                    .append("div")
                    .attr("class", "color-img-group")
                    .html("Colors Used in the Covers of Most Rated Books")
                )
                .append("div")
                .attr("id", "colors-chart-most-rated")
                .style("display", "flex")
                .selectAll("div.color-con")
                .data(data.filter((d) => d.image_group == "most_rated"))
                .join("div")
                .attr("class", "color-con")
                .style("background-color", d => d.color)
                .style("height", "40px")
                .style("width", d => d.percentage * 100 + "%")
                .html(d => d.percentage > (deviceType == "desktop" ? 0.0 : 0.012) ? (d.percentage * 100).toFixed(2) + "%" : "")
                .style("color", d => getLuminance(d.color.match(/\w\w/g).map(x => parseInt(x, 16))) > 0.179 ? "#000000a0" : "#ffffffa0")
                .style("font-size", d => d.percentage > (deviceType == "desktop" ? 0.05 : 0.12) ? "0.7rem" : d.percentage > (deviceType == "desktop" ? 0.025 : 0.069) ? "0.4rem" : "0");
            // .append("p")
            // .text(d => d.color)


            const colorChart3 = d3.select("#colors-chart")
                .call(g => g
                    .append("div")
                    .attr("class", "color-img-group")
                    .html("Colors Used in the Covers of the Top Rated Books")
                )
                .append("div")
                .attr("id", "colors-chart-top-rated")
                .style("display", "flex")
                .selectAll("div.color-con")
                .data(data.filter((d) => d.image_group == "top_rated"))
                .join("div")
                .attr("class", "color-con")
                .style("background-color", d => d.color)
                .style("height", "40px")
                .style("width", d => d.percentage * 100 + "%")
                .html(d => d.percentage > (deviceType == "desktop" ? 0.0 : 0.012) ? (d.percentage * 100).toFixed(2) + "%" : "")
                .style("color", d => getLuminance(d.color.match(/\w\w/g).map(x => parseInt(x, 16))) > 0.179 ? "#000000a0" : "#ffffffa0")
                .style("font-size", d => d.percentage > (deviceType == "desktop" ? 0.05 : 0.12) ? "0.7rem" : d.percentage > (deviceType == "desktop" ? 0.025 : 0.069) ? "0.4rem" : "0");
            // .append("p")
            // .text(d => d.color)


            const colorChart = d3.select("#colors-chart")
                .call(g => g
                    .append("div")
                    .attr("class", "color-img-group")
                    .html("Colors Used in a Random Sample of Book Covers")
                )
                .append("div")
                .attr("id", "colors-chart-sample")
                .style("display", "flex")
                .selectAll("div.color-con")
                .data(data.filter((d) => d.image_group == "sample"))
                .join("div")
                .attr("class", "color-con")
                .style("background-color", d => d.color)
                .style("height", "40px")
                .style("width", d => d.percentage * 100 + "%")
                .html(d => d.percentage > (deviceType == "desktop" ? 0.0 : 0.012) ? (d.percentage * 100).toFixed(2) + "%" : "")
                .style("color", d => getLuminance(d.color.match(/\w\w/g).map(x => parseInt(x, 16))) > 0.179 ? "#000000a0" : "#ffffffa0")
                .style("font-size", d => d.percentage > (deviceType == "desktop" ? 0.05 : 0.12) ? "0.7rem" : d.percentage > (deviceType == "desktop" ? 0.025 : 0.069) ? "0.4rem" : "0");
            // .append("p")
            // .text(d => d.color)

        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });


    // setTimeout(() => {
    // new LeaderLine(
    //     document.getElementById('filter-arrow-start'),
    //     document.getElementById('book-type-filter-wrapper')
    //   );
    // }, 2000);

}

let bookTypeFilter = "all";

document.addEventListener("DOMContentLoaded", processData);

// setTimeout(() => {
//     processData(); // xx
// }, 7000);

$('#book-type-filter-wrapper input[type="radio"]').on('change', (event) => {
    let val = $(event.target).val();
    bookTypeFilter = val;
    processData();

});

// when the C button on keyboard is pressed, change bookTypeFilter to non-fiction and trigger processData
document.addEventListener("keydown", (event) => {
    if ((event.key === 'N' || event.key === 'n') && event.shiftKey) {
        $("input[value='non-fiction']").click()
    } else if ((event.key === 'F' || event.key === 'f') && event.shiftKey) {
        $("input[value='fiction']").click()
    } else if ((event.key === 'A' || event.key === 'a') && event.shiftKey) {
        $("input[value='all']").click()
    }
});


let h1Counter = 0; // H1 counter
$('h1.top-heading').each(function() {
    if (["Data Used", "Method and Tools", "How to Use this Analysis"].includes($(this).text())) return;
    h1Counter++; // Increment H1 counter
    const h1SerialNumber = h1Counter; // Store current H1 serial number
    $(this).prepend(h1SerialNumber + '. '); // Prepend current H1 serial number

    let h2Counter = 0; // H2 counter within the current H1 context

    // Select all elements between this h1 and the next h1
    // Then find all h2.section-heading elements within those elements
    $(this).nextUntil('h1.top-heading').find('h2.section-heading').each(function() {
        h2Counter++; // Increment H2 counter
        $(this).prepend(h1SerialNumber + '.' + h2Counter + '. '); // Prepend hierarchical serial number to H2
    });
});

function htmlTableOfContents(documentRef) {
    var documentRef = documentRef || document;
    var toc = documentRef.getElementById("toc");
    // var headings = [].slice.call(documentRef.body.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    var headings = $('.wrapper').find('h1, h2, h3, h4, h5, h6').slice(2).slice(0, -1);
    headings.each(function (index, heading) {
        var ref = "toc" + index;
        if (heading.hasAttribute("id"))
            ref = heading.getAttribute("id");
        else
            heading.setAttribute("id", ref);

        var link = documentRef.createElement("a");
        link.setAttribute("href", "#" + ref);
        if (heading.textContent == "How to Use this Analysis") {
            link.style.fontWeight = "bold";
            link.textContent = heading.textContent + " 👈";
        } else {
            link.textContent = heading.textContent;
        }

        var div = documentRef.createElement("div");
        div.setAttribute("class", heading.tagName.toLowerCase());
        if ($(heading).hasClass("featured")) {
            $(div).addClass("featured");
        }
        div.appendChild(link);
        if ($(heading).hasClass("featured")) {
            $(div).append(`<span class="toc-star material-symbols-outlined">star</span>`);
        }
        toc.appendChild(div);
    });
}

htmlTableOfContents(document);


$("#filter-opener").on("click", function () {
    if ($("#book-type-filter-wrapper").css("display") == "none") {
        // $("#book-type-filter-wrapper").show(500);
        $("#book-type-filter-wrapper").css({
            display: 'flex',
            opacity: 0
        }).animate({ opacity: 1 }, 500);
        // $("#filter-opener").html("X");
        $("#filter-opener").addClass("filter-opener-close");
    } else {
        // $("#book-type-filter-wrapper").hide(500);
        $("#book-type-filter-wrapper").animate({ opacity: 0 }, 500, function () {
            $("#book-type-filter-wrapper").hide(); // Hide after animation completes
        });
        // $("#filter-opener").html("C");
        $("#filter-opener").removeClass("filter-opener-close");
    }
});

const targetElement = document.getElementById('show-fg-trg');

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            console.log('Element is now visible on screen');
            // Optionally, unobserve the element after noticing it
            // observer.unobserve(entry.target);
        }
    });
}, {
    root: null, // using the viewport as the bounding box
    rootMargin: '0px',
    threshold: [0.1] // trigger when at least 10% of the element is visible
});

observer.observe(targetElement);







// const openaiApiKey = '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'; 

// const data = {
//   model: "gpt-3.5-turbo",
//   messages: [
//     {
//       role: "system",
//       content: "You are a helpful assistant."
//     },
//     {
//       role: "user",
//       content: "Who won the world series in 2020?"
//     },
//     {
//       role: "assistant",
//       content: "The Los Angeles Dodgers won the World Series in 2020."
//     },
//     {
//       role: "user",
//       content: "Where was it played?"
//     }
//   ]
// };

// fetch('https://api.openai.com/v1/chat/completions', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${openaiApiKey}`
//   },
//   body: JSON.stringify(data)
// })
// .then(response => response.json())
// .then(data => console.log(data))
// .catch((error) => console.error('Error:', error));









// References:
// https://observablehq.com/@d3/hierarchical-bar-chart?intent=fork
// https://observablehq.com/@d3/diverging-bar-chart/2?intent=fork