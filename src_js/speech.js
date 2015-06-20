import { capitalize } from './utils';

const $searchTextArea = $( '.js-recipe--search' );
const start_img = $( '.js-recipe--search--audio img' );

const recognition = new window.webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';
let recognizing = false;
let final_transcript;
let timer;

recognition.onstart = () =>
{
    recognizing = true;
    start_img.attr( 'src', '//www.google.com/intl/en/chrome/assets/common/images/content/mic-animate.gif' );
};

recognition.onend = () =>
{
    recognizing = false;

    start_img.attr( 'src', '//www.google.com/intl/en/chrome/assets/common/images/content/mic.gif' );

    if ( !final_transcript )
    {
        return;
    }
};

recognition.onresult = event =>
{
    let interim_transcript = '';

    if ( typeof event.results === 'undefined' )
    {
        recognition.onend = null;
        recognition.stop();
        return;
    }

    for ( let i = event.resultIndex; i < event.results.length; ++i )
    {
        if ( event.results[i].isFinal )
        {
            final_transcript += event.results[i][0].transcript;
        }
        else
        {
            interim_transcript += event.results[i][0].transcript;
        }
    }

    $searchTextArea.text( capitalize( final_transcript || interim_transcript ) );
    $searchTextArea.trigger( 'change' );
};


export const speechListener = event =>
{
    if ( recognizing )
    {
        recognition.stop();
        clearInterval( timer );
        return;
    }
    final_transcript = '';
    $searchTextArea.text( '' );

    recognition.start();
    start_img.attr( 'src', '//www.google.com/intl/en/chrome/assets/common/images/content/mic-slash.gif' );
    startTimer();
};

const startTimer = () =>
{
    timer = setTimeout( () =>
    {
        recognition.stop();
        clearInterval( timer );
    }, 4000 );
};
