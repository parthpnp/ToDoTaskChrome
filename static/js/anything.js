list = [];
counter = 0;
state = "Todo";
var storage = chrome.storage.local;

$.fn.makeTodolist = function(str1) { //Model

    counter = counter + 1;
    var obj = {
        id: counter,
        text: str1,
        state: state,
    };
    list.push(obj);
    storage.set({list}, function() {
        $(this).renderTodoList();
    });
};

$.fn.updateProgressBar = function() {
    var done_count = 0;
    var todo_count = 0;
    var cancle_count = 0;
    var total_count = 0;

    for (var val in list) {
        switch (list[val].state) {
            case 'Todo':
                todo_count += 1;
                break;
            case 'Done':
                done_count += 1;
                break;
            case 'Cancle':
                cancle_count += 1;
                break;
            default:
                continue;
        }
        total_count += 1;
    }

    this.animateBadge(todo_count, $('.badgeTodo'));
    this.animateBadge(done_count, $('.badgeDone'));
    this.animateBadge(cancle_count, $('.badgeCancle'));
    this.animateBadge(total_count, $('.badgeTotal'));

    var $progress_done = $('.progress-bar-success');
    var $progress_todo = $('.progress-bar-primary');
    var $progress_cancle = $('.progress-bar-danger');
    $progress_done.animate({ width: (done_count / total_count) * 100 + "%" }, 200);
    $progress_todo.animate({ width: (todo_count / total_count) * 100 + "%" }, 200);
    $progress_cancle.animate({ width: (cancle_count / total_count) * 100 + "%" }, 200);

};
$.fn.animateBadge = function (end, $el) {
        $({ someValue: 0 }).animate({ someValue: end || 0 }, {
        duration: 1000,
        easing: 'swing',
        step: function() {
            $el.get(0).innerText = Math.round(this.someValue);
        }
    });
};
$.fn.renderTodoList = function() { //View
    if (list) {
        $("#tableTaskTodo tr:gt(1)").remove();
        $("#tableTaskDone tr:gt(0)").remove();
        $("#tableTaskCancle tr:gt(0)").remove();

        for (var data of list) {
            var table = document.getElementById("tableTask"+data.state);
            //Basic Structure
            var row = table.insertRow();
            row.className = "task_row";
            var cell0 = row.insertCell(0);
            var cell1 = row.insertCell(1);
            var cell2 = row.insertCell(2);
            var cell3 = row.insertCell(3);
            var cell4 = row.insertCell(4);
            cell0.innerHTML = "<i class='chip green fa fa-check doneTask' id='" + data.id + "'></i>";
            cell1.innerHTML = "<i class='chip red fa fa-times removeTask' id='" + data.id + "'></i>";
            cell2.innerHTML = data.id;
            cell3.innerHTML = data.text;
            cell3.className = "table_task_cell task_row";
            cell3.id = data.id;
            cell4.innerHTML = "<i class='fa fa-pencil' style='visibility:hidden;'></i>";

            if (data.state === 'Done') {
                this.renderDone($(row));
            } else if (data.state === 'Cancle') {
                this.renderCancle($(row));
            }
        }
        this.updateProgressBar();
    }
    $('.table_task_cell').attr('contenteditable', 'true');
};

$.fn.renderDone = function($el) {
    $el.closest('tr').toggleClass('alert-success');
    $el.find('.table_task_cell').attr({
        'contenteditable': 'false'
    });
    this.updateProgressBar();
};

$.fn.renderCancle = function($el) {
    $el.closest('tr').toggleClass('alert-danger strikeout');
    $el.find('.table_task_cell').attr({
        'contenteditable': 'false'
    });
    this.updateProgressBar();
};

function getLocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
  } else {
      return "NA";
  }
}
function showPosition(position) {
  $.simpleWeather({
    location: position.coords.latitude +','+ position.coords.longitude,
    unit: 'c',
    success: function(weather) {
      html = '<span class="big-font">'+weather.temp+'&deg;'+weather.units.temp+' <span class="me-font">'+weather.currently+'</span> <span class="sm-font">'+weather.wind.speed+' '+weather.units.speed+'</span></span>';
      html += '<p>'+weather.city+','+weather.region+'</p>';

      $("#widgetWeather").html(html);
    },
    error: function(error) {
      $("#widgetWeather").html('<p>'+error+'</p>');
    }
  });
}
function showDateTime() {
    html = '<span class="big-font pull-right">'+new Date().toLocaleTimeString('en-US',{ hour12: false})+'</span><br/><span class="me-font pull-right">'+new Date().toLocaleDateString()+'&nbsp;</span>';
    $("#widgetDateTime").html(html);
}
function getQOD() {
    $.get('https://quotes.rest/qod').then(function(res){
        var content = res.contents.quotes[0];
        $('.quote_text').html('<q>'+content.quote+'</q>');
        $('.author_text').html(content.author);
    });
}

$(document).ready(function() {

    //Letme Show you your Weather
    getLocation();
    setTimeout(showDateTime, 1000);
    getQOD();

    storage.get('FeatureDiscovery', function(items) {
        if (!items.FeatureDiscovery) {
            $('.tap-target').tapTarget('open');
            var FeatureDiscovery = {
              "Done": true
            };
            storage.set({FeatureDiscovery});
        }
    });
    storage.get('list', function(items) {
        if (items.list) {
            list = items.list;
            counter = list.length;
        }
        $(this).renderTodoList();
    });
    $('#tableTaskTodo, #tableTaskDone, #tableTaskCancle').on('click', '.removeTask', function(el) {
        var item_id = parseInt($(this).closest('.removeTask').attr('id'));
        for (var val in list) {
            if (list[val].id === item_id) {
                if (list[val].state === 'Cancle') {
                    list.splice(val,1);
                    storage.set({ list });
                    break;
                }
                list[val].state = 'Cancle';
                storage.set({ list });
                break;
            }
        }
        $(this).renderCancle($(this));
        $(this).renderTodoList();
    });

    $('#tableTaskTodo').on('click', '.doneTask', function(el) {
        var item_id = parseInt($(this).closest('.doneTask').attr('id'));
        for (var val in list) {
            if (list[val].id === item_id) {
                list[val].state = 'Done';
                storage.set({ list });
                break;
            }
        }
        Materialize.toast('Good Job !', 2500, 'rounded');
        $(this).renderDone($(this));
        $(this).renderTodoList();
    });

    $('#tableTaskTodo').on('click', '.addTaskBtn', function(el) {
        var task_name = $('.table_task_new_cell').val();
        if (task_name.length) {
            $(this).makeTodolist(task_name);
        }
        $('.table_task_new_cell').val(' ');
        $('.addTaskBtn').css('display','none');
        Materialize.toast('Voila ! New Task Created.', 3000, 'rounded');
    });
    $("#tableTaskTodo, #tableTaskDone, #tableTaskCancle").on('focusout', 'tr', function() {
        var $task = $(this).find('.table_task_cell')[0];
        if ($task) {
            var update_task = $task.innerText;
            var task_id = $task.id;
            if (update_task) {
                for (var val in list) {
                    if (list[val].id == task_id) {
                        list[val].text = update_task;
                        storage.set({ list });
                        console.log(task_id);
                    }
                }
            }
        }
    });
    $("#tableTaskTodo").on('focusin', '.table_task_new_cell', function() {
        $('.addTaskBtn').css('display','inline');
    });
    $("#tableTaskTodo").on('focusout', '.table_task_new_cell', function() {
        if(!$('.table_task_new_cell').hasClass('valid')){
            $('.addTaskBtn').css('display','none');
        }
    });

    $(".card-content").on('keydown', '#google_search', function(e) {
        if (e.keyCode == 13) {
            window.location.replace('http://google.com/search?q='+$('#google_search').val());
        }
    });

    $(".page_turn_off").on('click', function(e) {
        chrome.tabs.update({ url: "chrome-search://local-ntp/local-ntp.html" });
    });
});
