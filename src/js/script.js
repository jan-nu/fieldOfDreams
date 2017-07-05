(function ($, window, document, undefined) {

  'use strict';

  // Алфавит для выбора букв в игре
  var alphabet = ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'],
  
  // Текущий угол поворота барабана
			rotatedAngle = 0,
	// Шаг угла поворота барабана
			stepAngle = 180,
	// Признак запуска бесконечной анимации после начала вращения барабана
			isInfinite = true,
	// Анимация вращения барабана
			easing = 'easeInSine',
	// Продолжительность анимации вращения барабана
			rotateSpeed = 3000,
	// Признак останова вращения барабана
			isStopRotate = false,
	// Доступность барабана для вращения
			isRotateEnable = true,

	// Набранное количество очков
			pointsAmount = 0,
	// Доступность выбора буквы
			isLetterEnable = false,
	// Общее количество ошибок
			errorCount = 0,
	// Активный сектор (от 0 до 15)
			currentSector = 0,
	// Выбор буквы на табло для открытия
			isSelectLetterEnable = false,
	// Индекс тура
			roundIndex = 0,
	// Признак суперфинала
			isSuperFinal = false,

	// Опции cookie
    cookieOptions = {expires: 7, path: '/'};


  $(function () {

  	// Сохранить результат в куки
  	function saveResultToCookie() {
			var cookieName = 'fieldOfDreams';
			if ($.cookie(cookieName)) {
				if (parseInt($.cookie(cookieName)) > parseInt(pointsAmount)) {
					$('.fieldofdreams-popup-end__result-amount').text($.cookie(cookieName));
				} else {					
					$('.fieldofdreams-popup-end__result-amount').text(pointsAmount);
					$.cookie(cookieName, pointsAmount, cookieOptions);
				}
			} else {
				$('.fieldofdreams-popup-end__result-amount').text(pointsAmount);
				$.cookie(cookieName, pointsAmount, cookieOptions);
			}
  	}

  	// Инициализация загаданного слова
  	function initSecretWord() {
  		var wordLength = questions[roundIndex]['word'].length,
  				cellsCount = 21,
  				index = Math.floor(cellsCount/2 - wordLength/2);
  		for(var i = index; i<index + wordLength; i++) {
  			var letterHtml = '<div class="front"></div><div class="back">' 
		  								+ '<span class="fieldofdreams-field__letter" data-letter="'
		  								+ questions[roundIndex]['word'][i-index] + '"></span>'
		  								+ '</div>';
  			$('.fieldofdreams-field__list.game')
  				.find('.fieldofdreams-field__item').eq(i)
  				.append(letterHtml);
  			$('.fieldofdreams-field__list.game')
  				.find('.fieldofdreams-field__item').eq(i).addClass('closed');
  		}
  	}

  	// Инициализация тура
  	function initRound() {
  		isLetterEnable = false;
  		isRotateEnable = true;

  		var roundName = '';
  		switch(roundIndex) {
  			case 0: {
					roundName = '1 тур';
  			} break;
  			case 1: {
					roundName = '2 тур';
  			} break;
  			case 2: {
					roundName = '3 тур';
  			} break;
  			case 3: {
					roundName = 'финал';
  			} break;
  			case 4: {
					roundName = 'суперфинал';
					isSuperFinal = true;					
  			} break;
  		}
  		$('.fieldofdreams-round__name').text(roundName);
  		$('.fieldofdreams-round__question').text(questions[roundIndex]['desc']);

  		$('.fieldofdreams-letters__input').val('').hide();
  		$('.btn-know-word').show();

  		$('.fieldofdreams-drum__img').removeAttr('style');
  		rotatedAngle = 0;
  		easing = 'easeInSine';
  		stepAngle = 180;
  		if(!isSuperFinal) {
  			$('.fieldofdreams-game__points-msg').hide();
  			$('.btn-rotate-drum').show();
  		}
  		else {
  			$('.fieldofdreams-game__points-msg').text('Назовите слово целиком').show();
  			$('.btn-rotate-drum').hide();
  		}  			

  		$('.fieldofdreams-field__item, .fieldofdreams-letters__item').remove();
  		$('.fieldofdreams-field__list').each(function() {
	  		$(this).html('');
	  		var cellHtml = '<li class="fieldofdreams-field__item"></li>';
	  		for(var i = 0; i<21; i++) {
	  			$(this).append(cellHtml);
	  		}
	  	})

	  	for(var i = alphabet.length-1; i>=0; i--) {
	  		var cellHtml = '<li class="fieldofdreams-letters__item">\
	                        <span class="fieldofdreams-letters__value">'
	                        + alphabet[i] +
	                        '</span>\
	                      </li>';
	      $('.fieldofdreams-letters__list').prepend(cellHtml);
	  	}
	  	initSecretWord();
  	}

  	// Открытие закрытой буквы
  	function selectHiddenCell() {
  		$(document).on('click', '.fieldofdreams-field__item.closed', function() {
				if(!isSelectLetterEnable)
					return;

				isSelectLetterEnable = false;

				$(this).removeClass('closed').addClass('open');
				var span = $(this).find('.fieldofdreams-field__letter');
  			span.text(span.data('letter'));
  			var curLetter = span.data('letter');

  			$('.fieldofdreams-field__item.closed').each(function() {
  				var curSpan = $(this).find('.fieldofdreams-field__letter');
  				if(curLetter == curSpan.data('letter')) {
  					curSpan.text(curLetter);
  					$(this).removeClass('closed').addClass('open');
  				}
  			})
  			
  			$('.fieldofdreams-letters__item:not(.disabled)').each(function() {
  				var value = $(this).find('.fieldofdreams-letters__value').text();
  				if(value == curLetter) {
  					$(this).addClass('disabled');
  					return;
  				}
  			});
  			$('.fieldofdreams-game__points-msg').hide();
  			isRotateEnable = true;
  			checkGameWin();
  		})
  	}

  	// Выбор буквы из списка
  	function selectLetter() {
  		$(document).on('click', '.fieldofdreams-letters__item', function() {
  			if(!isLetterEnable)
  				return;

  			if($(this).hasClass('disabled'))
  				return;

  			isRotateEnable = true;

  			$(this).addClass('disabled');
  			isLetterEnable = false;

  			var selectedLetter = $(this).find('.fieldofdreams-letters__value').text();
  			var correctCount = 0;
  			$('.fieldofdreams-field__item.closed').each(function() {
  				if($(this).find('.fieldofdreams-field__letter').data('letter') == selectedLetter) {
  					$(this).removeClass('closed').addClass('open');
  					$(this).find('.fieldofdreams-field__letter').text(selectedLetter);
  					correctCount++;
  				}
  			});

  			countPoints(correctCount);
  			if(correctCount <= 0)
  				$(this).addClass('wrong');
  		})
  	}

  	// Получение очков после верного ответа
  	function getPoints() {
  		var msg = '';
			if(sectors[currentSector]['points'] > 0) {
				pointsAmount += sectors[currentSector]['points'];
				msg = 'Верно! Вы получаете ' + sectors[currentSector]['points'] + ' очков';
			} else {
				switch (sectors[currentSector]['code']) {
					case 'bankrupt': {
						pointsAmount  = 0;
						msg = 'Банкрот! Ваши очки обнуляются';
					} break;
					case 'x2': {							
						msg = 'Верно! Вы получаете ' + pointsAmount + ' очков';
						pointsAmount *=2;
					} break;
					case 'x3': {							
						msg = 'Верно! Вы получаете ' + (pointsAmount * 2) + ' очков';
						pointsAmount *=3;
					} break;
					case '0': {
						msg = 'Верно!';
					} break;
				}
			}
			$('.fieldofdreams-game__points-value').fadeOut(function() {
				$('.fieldofdreams-game__points-value').text(pointsAmount).fadeIn();
			})				
			$('.fieldofdreams-game__points-msg').text(msg);
  	}

  	// Подсчет количества очков
  	function countPoints(count) {
  		var msg = '';
  		if(count <= 0) {
  			msg = 'Нет такой буквы';
  			$('.fieldofdreams-game__points-msg').text(msg);
				errorCount++;
				checkGameFail();
  		} else {
  			getPoints();			
				setTimeout(function() {
					checkGameWin();
				}, 700);
				
  		}
  	}

  	// Получить сообщение о победе в туре
  	function getWinText() {
  		var msg = '';
  		switch(roundIndex) {
  			case 0: {
  				msg = 'Вы переходите<br>во 2 тур';
  			} break;
  			case 1: {
  				msg = 'Вы переходите<br>в 3 тур';
  			} break;
  			case 2: {
  				msg = 'Вы переходите<br>в финал';
  			} break;
  			case 3: {
  				msg = 'Вы переходите<br>в суперфинал';
  			} break;
  		}
  		return msg;
  	}

  	// Успешное прохождение раунда
  	function winRound() {
  		// Если не все туры пройдены, переход на следующий
			if(roundIndex<4) {  				
				var msg = getWinText();
				roundIndex++;
				$('.fieldofdreams-popup-congratulation__txt').html(msg);
				$('.fieldofdreams-popup-congratulation').show();
  			setTimeout(function() {
					$('.fieldofdreams-popup-congratulation').fadeOut(function() {							
						initRound();
					});
  			}, 3000);  				
			} 
			// Игра пройдена
			else {
				$('.fieldofdreams-popup-end, .fieldofdreams-popup-overlay').show();  	
				$('.fieldofdreams-popup-end__best-points').text(pointsAmount);	
				saveResultToCookie();		
			}	
  	}

  	// Проверка на прохождение тура/всей игры
  	function checkGameWin() {
  		// Если все буквы отгаданы
  		if(!$('.fieldofdreams-field__item.closed').length) {  			
  				winRound();
  		} 
  		// Если не все буквы отгаданы, продолжение игры
  		else {
  			$('.btn-rotate-drum').fadeIn();
  		}  		
  	}

  	// Проверка на количество сделанных ошибок и выход из игры в случае превышения 2 ошибок
  	function checkGameFail() {
  		if(errorCount>=3) {
				$('.fieldofdreams-popup-failed, .fieldofdreams-popup-overlay').show();
  		} else {
				$('.btn-rotate-drum').fadeIn();
  		}
  	}

  	// Проверка слова целиком
  	function checkFullWord() {
  		var answer = questions[roundIndex]['word'].trim().toLowerCase(),
  				shot = $('.fieldofdreams-letters__input').val().trim().toLowerCase();
  		if(shot == answer) {
  			getPoints();
				winRound();
  		} else {
  			$('.fieldofdreams-popup-failed, .fieldofdreams-popup-overlay').show();
  		}
  	}


  	initRound();
  	selectLetter();
  	selectHiddenCell();
  	sectorPrize();  	

		$('.start-game').on('click', function(e) {
			e.preventDefault();
			$('.fieldofdreams-popup-intro, .fieldofdreams-popup-overlay').hide();
		});

		$('.play-again').on('click', function(e) {
			e.preventDefault();
			$('.fieldofdreams-popup, .fieldofdreams-popup-overlay').hide();			
			roundIndex = 0;
			pointsAmount = 0;		
			isSuperFinal = false;	
			initRound();
			$('.fieldofdreams-game__points-value').fadeOut(function() {
				$('.fieldofdreams-game__points-value').text(pointsAmount).fadeIn();
			})
		})

  	$('.btn-rotate-drum').on('click', function(e) {
  		e.preventDefault();
  		if(!isRotateEnable)
  			return;
  		isRotateEnable = false;
  		$('.btn-rotate-drum').hide(); 
  		setTimeout(function() {
				$('.btn-stop-drum').show(); 
  		}, 3000);  				
  		$('.fieldofdreams-game__points-msg').hide();
  		isInfinite = true;
  		isStopRotate = false;
  		easing = 'easeInSine';
  		rotateSpeed = 3000;
  		stepAngle = 170;

  		// Выбор буквы недоступен
			isLetterEnable = false;
  		animateRotate();
  	});

  	$('.btn-stop-drum').on('click', function(e) {
  		e.preventDefault();  		
  		$('.btn-stop-drum').fadeOut();
  		isInfinite = false;
  	});

  	$('.btn-know-word').on('click', function(e) {
  		e.preventDefault();
  		if(!isLetterEnable && !isSuperFinal)
  			return;

  		$(this).hide();
  		$('.fieldofdreams-letters__input').val('').show().focus();
  	})

  	$('.fieldofdreams-letters__input').on('keyup', function(e) {
  		var code = e.which;
  		if(code==13) {
  			checkFullWord();
  		}
  	})

  	// Случайное число в диапазоне
  	function randomNumberFromRange(min,max)	{
			return Math.floor(Math.random()*(max-min+1)+min);
		}

		// Обработка результатов после останова барабана
		function getRotateResult() {			
			var rest = rotatedAngle % 360,
					msg = '';
			// Сектор, на котором остановилась стрелка
			currentSector = Math.floor(rest / 22.5);

			// Доступен выбор буквы
			isLetterEnable = true;

			if(sectors[currentSector]['points'] > 0) {
				msg = 'Угадайте букву<br>и получите ' + sectors[currentSector]['points'] + ' очков';
			} else {
				switch(sectors[currentSector]['code']) {
					case '0': {
						msg = 'Выберите букву';
					} break;
					case 'bankrupt': {
						msg = 'Банкрот! Ваши очки обнуляются';
						isLetterEnable = false;
						isRotateEnable = true;
						$('.btn-rotate-drum').fadeIn();
						pointsAmount = 0;
						$('.fieldofdreams-game__points-value').fadeOut(function() {
							$('.fieldofdreams-game__points-value').text(pointsAmount).fadeIn();
						})
					} break;
					case 'x2': {
						msg = 'Угадайте букву<br>и получите ' + pointsAmount + ' очков';
					} break;
					case 'x3': {
						msg = 'Угадайте букву<br>и получите ' + (pointsAmount*2) + ' очков';
					} break;
					case 'prize': {
						msg = 'Сектор "Приз"!!!';
						$('.fieldofdreams-game__prize').show();
					} break;
					case '+1': {
						msg = 'На табло открыта новая буква';
						isLetterEnable = false;
						isRotateEnable = true;
						showRandomLetter();
						$('.btn-rotate-drum').fadeIn();
					} break;
				}				
			}

			$('.fieldofdreams-game__points-msg').html(msg).fadeIn();	
		}

		// Выпадение сектора "Приз"
		function sectorPrize() {
			// Выбрать приз
			$('.btn-get-prize').on('click', function(e) {
				e.preventDefault();
				$('.fieldofdreams-game__prize').hide();
				isSelectLetterEnable = true;
				var newPoints = randomNumberFromRange(1,10) * 100,
						msg = 'Вы получаете ' + newPoints + ' очков. Выберите на табло букву, чтобы ее открыть';
				pointsAmount += newPoints;
				$('.fieldofdreams-game__points-msg').html(msg).show();	
				$('.fieldofdreams-game__points-value').fadeOut(function() {
					$('.fieldofdreams-game__points-value').text(pointsAmount).fadeIn();
				});
			});

			// Отказаться от приза
			$('.btn-reject-prize').on('click', function(e) {
				e.preventDefault();
				$('.fieldofdreams-game__prize').hide();
				var msg = 'Выберите букву';
				isLetterEnable = true;
				$('.fieldofdreams-game__points-msg').html(msg).fadeIn();	
			});
		}

		// Показ произвольной буквы на табло
		function showRandomLetter() {
			var count = $('.fieldofdreams-field__item.closed').length,
					rngIndex = randomNumberFromRange(1, count) - 1,
					rndLetter = $('.fieldofdreams-field__item.closed').eq(rngIndex)
											.find('.fieldofdreams-field__letter').data('letter');

			$('.fieldofdreams-field__item.closed').eq(rngIndex)
									.find('.fieldofdreams-field__letter').text(rndLetter);
			$('.fieldofdreams-field__item.closed').eq(rngIndex).removeClass('closed').addClass('open');

			$('.fieldofdreams-field__item.closed').each(function() {
				var curSpan = $(this).find('.fieldofdreams-field__letter');
				if(rndLetter == curSpan.data('letter')) {
					curSpan.text(rndLetter);
					$(this).removeClass('closed').addClass('open');
				}
			})

			$('.fieldofdreams-letters__item:not(.disabled)').each(function() {
				var value = $(this).find('.fieldofdreams-letters__value').text();
				if(value == rndLetter) {
					$(this).addClass('disabled');
					return;
				}
			})

			checkGameWin();
		}

  	
		// Вращение барабана
  	function animateRotate() {
  		var newAngle = rotatedAngle + stepAngle;
	    var $elem = $('.fieldofdreams-drum__img');

	    $({deg: rotatedAngle}).animate({deg: newAngle}, {
	        duration: rotateSpeed,
	        easing: easing,
	        step: function(now) {
	            $elem.css({
	                transform: 'rotate(' + now + 'deg)'
	            });
	        }, complete: function() {
			    	rotatedAngle = newAngle;
			    	// Если была выполнена анимация останова вращения, выход
			    	if(isStopRotate) {
			    		getRotateResult();			    		
			    		return;
			    	}
			    	// Если барабан запущен, продолжаем крутить равномерно рандомными шагами
			    	if(isInfinite) {
			    		easing = 'linear';
			    		rotateSpeed = randomNumberFromRange(300, 2000);
			    		stepAngle = rotateSpeed/10;
			    		animateRotate();
			    	} 
			    	// Если была дана команда останова барабана, запускаем анимацию останова
			    	else {
			    		easing = 'easeOutSine';
			    		stepAngle = 180;
			    		rotateSpeed = 3000;
			    		animateRotate();
			    		isStopRotate = true;
			    	}
			    }
	  })
	    
	}


  });

})(jQuery, window, document);