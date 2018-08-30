// Call Module
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
//template is from lib/template.js as a module
var template = require('./lib/template.js');

// CREATE SERVER
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
// Define Error 404 if pathname is '/', page is fine
    if(pathname === '/'){
// WELCOME PAGE (?id = undefined)
      if(queryData.id === undefined){
// Function Read Directory
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.LIST( filelist );
          var html = template.HTML( title, list, `<h2>${title}</h2>${description}`,
          `<a href = '/create'>CREATE</a>` );
          response.writeHead(200);
          response.end(html);
        })

      } else {
        fs.readdir('./data', function(error, filelist){
          fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
            var title = queryData.id;
            var list = template.LIST(filelist);
            var html = template.HTML( title, list, `<h2>${title}</h2>${description}`,
            ` <a href = '/create'>CREATE</a>
              <a href = '/update?id=${title}'>UPDATE</a>
              <form action = "/delete_process" method = "post">
                <input type = "hidden" name = "id" value = ${title}/>
                <input type = "submit" value = "delete"/>
              </form>
              ` );
            response.writeHead(200);
            response.end(html);
          });
        });
      }
// HTML FROM
} else if (pathname === '/create'){
  fs.readdir('./data', function(error, filelist){
    var title = 'WEB - CREATE';
    var list = template.LIST( filelist );
    var html = template.HTML( title, list, `
      <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
      </form>
      `, '' );
    response.writeHead(200);
    response.end(html);
  })

// MAKE A FILE WITH POST DATA
} else if( pathname === '/create_process'){
  var body = '';
  // SAVE post data to body
  request.on('data', function(data){
    body += data;
  });
  request.on('end', function(){
    var post = qs.parse(body);
    var title = post.title;
    var description = post.description
    fs.writeFile(`data/${title}`, description, 'utf8', function(error){
      // Redirection
      response.writeHead(302, {Location: `/?id=${title}`});
      response.end();
    });
  });
}else if( pathname === '/update' ) {
  fs.readdir('./data', function(error, filelist){
    fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
      var title = queryData.id;
      var list = template.LIST(filelist);
      var html = template.HTML( title, list,
        `
        <form action="/update_process" method="post">
              <input type = "hidden" name = "id" value = ${title}>
              <p><input type="text" name="title" value=${title}></p>
              <p>
                <textarea name="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
        </form>
        `,
        `<a href = '/create'>CREATE</a> <a href = '/update?id=${title}'>UPDATE</a>` );
      response.writeHead(200);
      response.end(html);
    });
  });
} else if( pathname === '/update_process' ){
  var body = '';
  // SAVE post data to body
  request.on('data', function(data){
    body += data;
  });
  request.on('end', function(){
    var post = qs.parse(body);
    var id = post.id;
    var title = post.title;
    var description = post.description
    fs.rename( `data/${id}`, `data/${title}`, function( error ){
      fs.writeFile(`data/${title}`, description, 'utf8', function(error){
        // Redirection
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end();
      });
    });
  });
} else if( pathname === '/delete_process' ){
  var body = '';
  // SAVE post data to body
  request.on('data', function(data){
    body += data;
  });
  request.on('end', function(){
    var post = qs.parse(body);
    var id = post.id;
    fs.unlink(`data/${id}`, function(error){
      response.writeHead(302, {Location: `/`});
      response.end();
    });
  });
} else {
      response.writeHead(404);
      response.end('Not found');
    }



});
app.listen(3000);
