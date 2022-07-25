test('双向绑定test',()=>{
    
    let input = document.querySelector('input');
    input.value = "name";
    let event = document.createEvent('HTMLEvents');
    event.initEvent('input',true,true);
    input.dispatchEvent(event);
    expect(document.querySelector('p').innerHTML).toBe('name');
 
});