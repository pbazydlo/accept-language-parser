var parser = require("../index.js");
var assert = require("assert");
var should = require("should");

var assertResult = function(expected, actual){
    actual.code.should.eql(expected.code);
    if(actual.region || expected.region){
        actual.region.should.eql(expected.region)
    }
    actual.quality.should.eql(expected.quality);
}

describe('accept-language#parse()', function(){
    it('should correctly parse the language with quality', function(){
        var result = parser.parse('en-GB;q=0.8');
        assertResult({ code: 'en', region: 'GB', quality: 0.8}, result[0]);
    });

    it('should correctly parse the language without quality (default 1)', function(){
        var result = parser.parse('en-GB');
        assertResult({ code: 'en', region: 'GB', quality: 1.0}, result[0]);
    });

    it('should correctly parse the language without region', function(){
        var result = parser.parse('en;q=0.8');
        assertResult({ code: 'en', quality: 0.8}, result[0]);
    });

    // This needs to be changed to preserve the full code.
    it('should ignore extra characters in the region code', function(){
        var result = parser.parse('az-AZ');
        assertResult({ code: 'az', region: 'AZ', quality: 1.0}, result[0]);
    });

    it('should correctly parse a multi-language set', function(){
        var result = parser.parse('fr-CA,fr;q=0.8');
        assertResult({ code: 'fr', region: 'CA', quality: 1.0}, result[0]);
        assertResult({ code: 'fr', quality: 0.8}, result[1]);
    });

    it('should correctly parse a wildcard', function(){
        var result = parser.parse('fr-CA,*;q=0.8');
        assertResult({ code: 'fr', region: 'CA', quality: 1.0}, result[0]);
        assertResult({ code: '*', quality: 0.8}, result[1]);
    });

    it('should correctly parse complex set', function(){
        var result = parser.parse('fr-CA,fr;q=0.8,en-US;q=0.6,en;q=0.4,*;q=0.1');
        assertResult({ code: 'fr', region: 'CA', quality: 1.0}, result[0]);
        assertResult({ code: 'fr', quality: 0.8}, result[1]);
        assertResult({ code: 'en', region: 'US', quality: 0.6}, result[2]);
        assertResult({ code: 'en', quality: 0.4}, result[3]);
        assertResult({ code: '*', quality: 0.1}, result[4]);
    });

    it('should cope with random whitespace', function(){
        var result = parser.parse('fr-CA, fr;q=0.8,  en-US;q=0.6,en;q=0.4,    *;q=0.1');
        assertResult({ code: 'fr', region: 'CA', quality: 1.0}, result[0]);
        assertResult({ code: 'fr', quality: 0.8}, result[1]);
        assertResult({ code: 'en', region: 'US', quality: 0.6}, result[2]);
        assertResult({ code: 'en', quality: 0.4}, result[3]);
        assertResult({ code: '*', quality: 0.1}, result[4]);
    });

    it('should sort based on quality value', function(){
        var result = parser.parse('fr-CA,fr;q=0.2,en-US;q=0.6,en;q=0.4,*;q=0.5');
        assertResult({ code: 'fr', region: 'CA', quality: 1.0}, result[0]);
        assertResult({ code: 'en', region: 'US', quality: 0.6}, result[1]);
        assertResult({ code: '*', quality: 0.5}, result[2]);
        assertResult({ code: 'en', quality: 0.4}, result[3]);
        assertResult({ code: 'fr', quality: 0.2}, result[4]);
    });
});

describe('accept-language#pick()', function(){
    it('should pick a specific regional language', function(){
        var result = parser.pick(['en-US', 'fr-CA'], 'fr-CA,fr;q=0.2,en-US;q=0.6,en;q=0.4,*;q=0.5');
        assert.equal(result, 'fr-CA');
    });

    it('should pick a specific language', function(){
        var result = parser.pick(['en', 'fr-CA'], 'ja-JP,ja;1=0.5,en;q=0.2');
        assert.equal(result, 'en');
    });

    it('should return null if no matches are found', function(){
        var result = parser.pick(['ko-KR'], 'fr-CA,fr;q=0.8,en-US;q=0.6,en;q=0.4,*;q=0.1');
        assert.equal(result, null);
    });

    it('should return null if support no languages', function(){
        var result = parser.pick([], 'fr-CA,fr;q=0.8,en-US;q=0.6,en;q=0.4,*;q=0.1');
        assert.equal(result, null);
    });

    it('should return null if invalid support', function(){
        var result = parser.pick(undefined, 'fr-CA,fr;q=0.8,en-US;q=0.6,en;q=0.4,*;q=0.1');
        assert.equal(result, null);
    });

    it('should return null if invalid accept-language', function(){
        var result = parser.pick(['en']);
        assert.equal(result, null);
    });
});
